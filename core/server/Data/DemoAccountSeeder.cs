using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Models;

namespace Server.Data;

/// <summary>
/// Cuenta de la demo pública: SeedDemo:Email (por defecto operador.demo@hpdglass.com) con
/// SeedDemo:Password; sin contraseña no existe. Sus credenciales se muestran en /ingresar, así
/// que es un Operador y cada arranque la crea o la restaura (activa, con su rol y la contraseña
/// configurada), aunque Database:SeedDemoData esté apagado. Ninguna otra cuenta puede usar
/// esa contraseña pública.
/// </summary>
public static class DemoAccountSeeder
{
    /// <summary>Autor de parte de los datos de ejemplo; nadie inicia sesión con él.</summary>
    public const string SampleSupervisorEmail = "supervisor.demo@hpdglass.com";

    public static string? DemoEmail(IConfiguration configuration) =>
        configuration["SeedDemo:Email"]?.Trim().ToLowerInvariant() is { Length: > 0 } email ? email : null;

    public static async Task SeedAsync(AppDbContext context, IConfiguration configuration, ILogger logger, CancellationToken cancellationToken)
    {
        var email = DemoEmail(configuration);
        var password = configuration["SeedDemo:Password"];
        if (email is null || string.IsNullOrWhiteSpace(password)) return;

        var hasher = new PasswordHasher<User>();
        var demo = await context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (demo is null)
        {
            var site = await context.Sites.OrderBy(s => s.Id).FirstOrDefaultAsync(s => s.Type == SiteType.ProcessingPlant, cancellationToken)
                ?? await context.Sites.OrderBy(s => s.Id).FirstAsync(cancellationToken);
            demo = new User
            {
                FullName = configuration["SeedDemo:FullName"] ?? "Diego Salazar Ríos",
                Email = email,
                Role = UserRole.Operator,
                SiteId = site.Id
            };
            demo.PasswordHash = hasher.HashPassword(demo, password);
            context.Users.Add(demo);
            logger.LogInformation("Cuenta demo creada: {Email}", email);
        }
        else if (demo.Role == UserRole.Admin)
        {
            // Una configuración equivocada nunca degrada a un administrador real.
            logger.LogError("SeedDemo:Email ({Email}) es de un administrador; no se usa como cuenta demo.", email);
            return;
        }
        else
        {
            // Solo reescribe lo que cambió: rehacer el hash en cada arranque no hace falta.
            if (hasher.VerifyHashedPassword(demo, demo.PasswordHash, password) == PasswordVerificationResult.Failed)
            {
                demo.PasswordHash = hasher.HashPassword(demo, password);
            }
            demo.Role = UserRole.Operator;
            demo.IsActive = true;
        }

        // Versiones anteriores sembraban al supervisor de ejemplo con esta misma contraseña: con
        // ella cualquiera veía las solicitudes de contacto, que tienen datos personales.
        var supervisor = await context.Users.FirstOrDefaultAsync(u => u.Email == SampleSupervisorEmail, cancellationToken);
        if (supervisor is not null && supervisor.Email != email
            && hasher.VerifyHashedPassword(supervisor, supervisor.PasswordHash, password) != PasswordVerificationResult.Failed)
        {
            supervisor.PasswordHash = UnusablePasswordHash(hasher, supervisor);
            logger.LogInformation("{Email} ya no usa la contraseña pública de la demo.", SampleSupervisorEmail);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>Hash de una contraseña aleatoria que nadie conoce: la cuenta no puede iniciar sesión.</summary>
    public static string UnusablePasswordHash(PasswordHasher<User> hasher, User user) =>
        hasher.HashPassword(user, Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)));
}
