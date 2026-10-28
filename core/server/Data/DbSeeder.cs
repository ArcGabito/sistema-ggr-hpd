using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

public static class DbSeeder
{
    /// <summary>
    /// Data/ClientSeedData.cs contiene datos personales y no se versiona (ver .gitignore).
    /// Se busca por reflexión para que el proyecto compile aunque el archivo no exista.
    /// </summary>
    private static IReadOnlyList<Client>? LoadLocalClientSeed() =>
        typeof(DbSeeder).Assembly
            .GetType("Server.Data.ClientSeedData")?
            .GetProperty("Clients", BindingFlags.Public | BindingFlags.Static)?
            .GetValue(null) as IReadOnlyList<Client>;

    public static async Task MigrateAndSeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DbSeeder));

        // SQL Server tarda en aceptar conexiones cuando el contenedor recién arranca.
        const int maxAttempts = 10;
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await context.Database.MigrateAsync(cancellationToken);
                break;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning("Base de datos no disponible (intento {Attempt}/{Max}): {Message}", attempt, maxAttempts, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
            }
        }

        if (!await context.Sites.AnyAsync(cancellationToken))
        {
            context.Sites.AddRange(CatalogSeedData.Sites);
        }

        if (!await context.Products.AnyAsync(cancellationToken))
        {
            context.Products.AddRange(CatalogSeedData.Products);
        }

        if (!await context.Vehicles.AnyAsync(cancellationToken))
        {
            context.Vehicles.AddRange(CatalogSeedData.Vehicles);
        }

        if (!await context.Drivers.AnyAsync(cancellationToken))
        {
            context.Drivers.AddRange(CatalogSeedData.Drivers);
        }

        if (!await context.BlogPosts.AnyAsync(cancellationToken))
        {
            context.BlogPosts.AddRange(BlogSeedData.Posts);
        }

        await context.SaveChangesAsync(cancellationToken);

        var seedClients = LoadLocalClientSeed();
        if (seedClients is null)
        {
            logger.LogInformation("Data/ClientSeedData.cs no está presente: se omite la carga de clientes.");
        }
        else if (!await context.Clients.AnyAsync(cancellationToken))
        {
            context.ChangeTracker.AutoDetectChangesEnabled = false;
            foreach (var chunk in seedClients.Chunk(500))
            {
                context.Clients.AddRange(chunk);
                await context.SaveChangesAsync(cancellationToken);
                context.ChangeTracker.Clear();
            }
            context.ChangeTracker.AutoDetectChangesEnabled = true;
            logger.LogInformation("Clientes sembrados: {Count}", seedClients.Count);
        }

        var adminEmail = configuration["SeedAdmin:Email"];
        var adminPassword = configuration["SeedAdmin:Password"];
        if (!string.IsNullOrWhiteSpace(adminEmail) && !string.IsNullOrWhiteSpace(adminPassword)
            && !await context.Users.AnyAsync(u => u.Email == adminEmail, cancellationToken))
        {
            var headquarters = await context.Sites.FirstAsync(s => s.Type == SiteType.Headquarters, cancellationToken);
            var admin = new User
            {
                FullName = configuration["SeedAdmin:FullName"] ?? "Administrador HPD",
                Email = adminEmail.Trim().ToLowerInvariant(),
                Role = UserRole.Admin,
                SiteId = headquarters.Id
            };
            admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, adminPassword);
            context.Users.Add(admin);
            await context.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Usuario administrador creado: {Email}", admin.Email);
        }
    }
}
