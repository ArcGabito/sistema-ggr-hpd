using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Services;

namespace Server.Data;

/// <summary>
/// Datos de demostración para desarrollo: usuarios por rol, flota adicional, guías de remisión en
/// todos sus estados, despachos, solicitudes de contacto y artículos propios del blog.
/// Se activa con Database:SeedDemoData y solo actúa sobre una base sin guías, así que es seguro
/// ejecutarlo en cada arranque. Usa una semilla fija: siempre genera los mismos datos.
/// </summary>
public static class DemoDataSeeder
{
    private static readonly TimeSpan LimaOffset = TimeSpan.FromHours(-5);

    public static async Task SeedAsync(AppDbContext context, IConfiguration configuration, ILogger logger, CancellationToken cancellationToken)
    {
        if (await context.RemissionGuides.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Datos de demostración omitidos: ya existen guías de remisión.");
            return;
        }

        var random = new Random(20418528);
        var sites = await context.Sites.OrderBy(s => s.Id).ToListAsync(cancellationToken);
        var products = await context.Products.OrderBy(p => p.Id).ToListAsync(cancellationToken);
        var admin = await context.Users.OrderBy(u => u.Id).FirstOrDefaultAsync(cancellationToken);
        if (sites.Count == 0 || products.Count == 0 || admin is null)
        {
            logger.LogWarning("Datos de demostración omitidos: faltan sedes, productos o el usuario administrador.");
            return;
        }

        var users = await SeedUsersAsync(context, configuration, sites, admin, cancellationToken);
        var (vehicles, drivers) = await SeedFleetAsync(context, cancellationToken);
        var clients = await LoadClientsAsync(context, cancellationToken);
        var headquarters = sites.First(s => s.Type == SiteType.Headquarters);
        var plant = sites.FirstOrDefault(s => s.Type == SiteType.ProcessingPlant) ?? headquarters;

        var todayLima = (DateTime.UtcNow + LimaOffset).Date;
        DateTime LimaToUtc(DateTime limaDate, int hour, int minute = 0) =>
            DateTime.SpecifyKind(limaDate.AddHours(hour).AddMinutes(minute) - LimaOffset, DateTimeKind.Utc);

        // ---------- Guías: 45 días de historia, hoy y mañana ----------
        var guides = new List<RemissionGuide>();
        RemissionGuide NewGuide(DateTime limaDay, Site origin, RemissionGuideStatus status, int transferDayOffset = 0)
        {
            var client = clients[random.Next(clients.Count)];
            var guide = new RemissionGuide
            {
                ClientId = client.Id,
                OriginSiteId = origin.Id,
                DeliveryAddress = DeliveryAddress(client, random),
                IssueDate = LimaToUtc(limaDay, 8 + random.Next(4), random.Next(60)),
                TransferDate = LimaToUtc(limaDay.AddDays(transferDayOffset), 12),
                TransferReason = random.Next(10) switch { 0 => TransferReason.TransferBetweenSites, 1 => TransferReason.Return, _ => TransferReason.Sale },
                Status = status,
                Notes = random.Next(4) == 0 ? Notes[random.Next(Notes.Length)] : null,
                CreatedById = users[random.Next(users.Count)].Id,
                Items = BuildItems(products, random)
            };
            guide.CreatedAt = guide.IssueDate;
            guide.TotalWeightKg = guide.Items.Sum(i => i.WeightKg);
            guides.Add(guide);
            return guide;
        }

        var dispatches = new List<Dispatch>();
        var dispatchCounters = new Dictionary<string, int>();
        // Un vehículo o conductor no puede estar en dos despachos activos a la vez (regla de la API).
        var busyVehicles = new HashSet<int>();
        var busyDrivers = new HashSet<int>();
        Dispatch NewDispatch(DateTime scheduledUtc, Site site, DispatchStatus status, IReadOnlyList<RemissionGuide> assigned)
        {
            var prefix = $"DSP-{scheduledUtc:yyMMdd}-";
            dispatchCounters[prefix] = dispatchCounters.GetValueOrDefault(prefix) + 1;
            var weight = assigned.Sum(g => g.TotalWeightKg);
            var active = status != DispatchStatus.Completed;
            var candidates = active ? vehicles.Where(v => !busyVehicles.Contains(v.Id)).ToList() : vehicles;
            var vehicle = candidates.Where(v => v.CapacityKg >= weight).OrderBy(_ => random.Next()).FirstOrDefault()
                ?? candidates.OrderByDescending(v => v.CapacityKg).First();
            var availableDrivers = active ? drivers.Where(d => !busyDrivers.Contains(d.Id)).ToList() : drivers;
            var driver = availableDrivers[random.Next(availableDrivers.Count)];
            if (active)
            {
                busyVehicles.Add(vehicle.Id);
                busyDrivers.Add(driver.Id);
            }
            var dispatch = new Dispatch
            {
                Code = $"{prefix}{dispatchCounters[prefix]:D3}",
                Status = status,
                SiteId = site.Id,
                VehicleId = vehicle.Id,
                DriverId = driver.Id,
                ScheduledAt = scheduledUtc,
                CreatedById = users[random.Next(users.Count)].Id,
                CreatedAt = scheduledUtc.AddHours(-20),
                Notes = random.Next(3) == 0 ? "Coordinar ingreso con el residente de obra." : null,
                Guides = assigned.ToList()
            };
            dispatches.Add(dispatch);
            return dispatch;
        }

        // Historia: guías entregadas en despachos completados, con algunas anuladas.
        for (var daysAgo = 45; daysAgo >= 1; daysAgo--)
        {
            var day = todayLima.AddDays(-daysAgo);
            if (day.DayOfWeek == DayOfWeek.Sunday) continue;

            var origin = random.Next(3) == 0 ? plant : headquarters;
            var delivered = Enumerable.Range(0, 1 + random.Next(3))
                .Select(_ => NewGuide(day, origin, RemissionGuideStatus.Delivered))
                .ToList();
            foreach (var batch in delivered.Chunk(2))
            {
                var departed = LimaToUtc(day, 13 + random.Next(3));
                var dispatch = NewDispatch(LimaToUtc(day, 12), origin, DispatchStatus.Completed, batch);
                dispatch.DepartedAt = departed;
                dispatch.CompletedAt = departed.AddHours(2 + random.NextDouble() * 4);
                foreach (var guide in batch) guide.UpdatedAt = dispatch.CompletedAt;
            }

            if (random.Next(9) == 0)
            {
                var cancelled = NewGuide(day, origin, RemissionGuideStatus.Cancelled);
                cancelled.Notes = "Anulada: el cliente reprogramó la entrega.";
                cancelled.UpdatedAt = cancelled.IssueDate.AddHours(3);
            }
        }

        // Hoy: un despacho en ruta, otro en carga, guías emitidas sin despacho y borradores.
        var inTransit = Enumerable.Range(0, 3).Select(_ => NewGuide(todayLima, headquarters, RemissionGuideStatus.InTransit)).ToList();
        var onRoute = NewDispatch(LimaToUtc(todayLima, 8), headquarters, DispatchStatus.InTransit, inTransit);
        onRoute.DepartedAt = LimaToUtc(todayLima, 8, 40);
        foreach (var guide in inTransit) guide.UpdatedAt = onRoute.DepartedAt;

        var loading = Enumerable.Range(0, 2).Select(_ => NewGuide(todayLima, plant, RemissionGuideStatus.Issued)).ToList();
        NewDispatch(LimaToUtc(todayLima, 14), plant, DispatchStatus.Loading, loading);

        for (var i = 0; i < 4; i++) NewGuide(todayLima, i % 2 == 0 ? headquarters : plant, RemissionGuideStatus.Issued);
        for (var i = 0; i < 2; i++) NewGuide(todayLima, headquarters, RemissionGuideStatus.Draft, transferDayOffset: 1);

        // Mañana: despacho programado con guías ya emitidas.
        var tomorrow = Enumerable.Range(0, 3).Select(_ => NewGuide(todayLima, headquarters, RemissionGuideStatus.Issued, transferDayOffset: 1)).ToList();
        NewDispatch(LimaToUtc(todayLima.AddDays(1), 9), headquarters, DispatchStatus.Scheduled, tomorrow);

        // Numeración correlativa en orden de emisión, como lo haría el sistema.
        var number = 0;
        foreach (var guide in guides.OrderBy(g => g.IssueDate)) guide.Number = ++number;

        context.RemissionGuides.AddRange(guides);
        context.Dispatches.AddRange(dispatches);
        await context.SaveChangesAsync(cancellationToken);

        // ---------- Solicitudes de contacto ----------
        if (!await context.ContactRequests.AnyAsync(cancellationToken))
        {
            context.ContactRequests.AddRange(ContactRequests.Select((request, i) => new ContactRequest
            {
                FullName = request.Name,
                Company = request.Company,
                Email = request.Email,
                PhoneNumber = request.Phone,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow.AddHours(-(i * 19 + 2)),
                IsAttended = i >= 4
            }));
        }

        // ---------- Artículos propios del blog ----------
        foreach (var post in BlogPosts(admin.Id))
        {
            if (!await context.BlogPosts.AnyAsync(p => p.Slug == post.Slug, cancellationToken)) context.BlogPosts.Add(post);
        }

        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Datos de demostración creados: {Guides} guías, {Dispatches} despachos, {Users} usuarios, {Clients} clientes disponibles.",
            guides.Count, dispatches.Count, users.Count, clients.Count);
    }

    private static async Task<List<User>> SeedUsersAsync(AppDbContext context, IConfiguration configuration, List<Site> sites, User admin, CancellationToken cancellationToken)
    {
        var users = new List<User> { admin };
        var password = configuration["SeedDemo:Password"];
        if (string.IsNullOrWhiteSpace(password)) return users;

        var hasher = new PasswordHasher<User>();
        var plant = sites.FirstOrDefault(s => s.Type == SiteType.ProcessingPlant) ?? sites[0];
        (string Name, string Email, UserRole Role, Site Site)[] demoUsers =
        [
            ("Rosa Castillo Vega", "supervisor.demo@hpdglass.com", UserRole.Supervisor, sites[0]),
            ("Diego Salazar Ríos", "operador.demo@hpdglass.com", UserRole.Operator, plant)
        ];

        foreach (var (name, email, role, site) in demoUsers)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
            if (user is null)
            {
                user = new User { FullName = name, Email = email, Role = role, SiteId = site.Id };
                user.PasswordHash = hasher.HashPassword(user, password);
                context.Users.Add(user);
            }
            users.Add(user);
        }

        await context.SaveChangesAsync(cancellationToken);
        return users;
    }

    private static async Task<(List<Vehicle>, List<Driver>)> SeedFleetAsync(AppDbContext context, CancellationToken cancellationToken)
    {
        (string Plate, string Brand, string Model, decimal Capacity)[] vehicles =
        [
            ("F4R-218", "Mercedes-Benz", "Atego 1726", 12000),
            ("A9K-640", "Foton", "Aumark S 3.5", 3500)
        ];
        foreach (var (plate, brand, model, capacity) in vehicles)
        {
            if (!await context.Vehicles.AnyAsync(v => v.Plate == plate, cancellationToken))
            {
                context.Vehicles.Add(new Vehicle { Plate = plate, Brand = brand, Model = model, CapacityKg = capacity });
            }
        }

        (string Name, string Dni, string Phone)[] drivers =
        [
            ("Miguel Ángel Torres Huanca", "44120387", "954218730"),
            ("Raúl Benavides Cárdenas", "46893015", "963501248")
        ];
        foreach (var (name, dni, phone) in drivers)
        {
            if (!await context.Drivers.AnyAsync(d => d.DocumentNumber == dni, cancellationToken))
            {
                context.Drivers.Add(new Driver { FullName = name, DocumentNumber = dni, LicenseNumber = $"{name[0]}{dni}", PhoneNumber = phone });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        return (
            await context.Vehicles.Where(v => v.IsActive).OrderBy(v => v.Id).ToListAsync(cancellationToken),
            await context.Drivers.Where(d => d.IsActive).OrderBy(d => d.Id).ToListAsync(cancellationToken));
    }

    /// <summary>Usa los clientes reales si están cargados; si no, crea clientes ficticios.</summary>
    private static async Task<List<Client>> LoadClientsAsync(AppDbContext context, CancellationToken cancellationToken)
    {
        var clients = await context.Clients
            .Where(c => c.TaxId != null && c.Address != null && (c.CompanyName != null || c.LegalName != null))
            .OrderBy(c => c.Id)
            .Take(80)
            .ToListAsync(cancellationToken);
        if (clients.Count >= 10) return clients;

        var demoClients = DemoClients.Select(c => new Client
        {
            CompanyName = c.Company,
            LegalName = c.Legal,
            TaxId = c.Ruc,
            FirstName = c.First,
            LastName = c.Last,
            JobTitle = "Logística",
            PhoneNumber = c.Phone,
            Address = c.Address,
            District = c.District,
            Province = "Lima",
            Industry = "Construcción"
        }).ToList();
        context.Clients.AddRange(demoClients);
        await context.SaveChangesAsync(cancellationToken);
        return [.. clients, .. demoClients];
    }

    private static string DeliveryAddress(Client client, Random random)
    {
        var parts = new[] { client.Address, client.District, client.Province }.Where(p => !string.IsNullOrWhiteSpace(p));
        var address = string.Join(", ", parts);
        return random.Next(3) == 0 ? $"Obra: {address}" : address;
    }

    private static List<RemissionGuideItem> BuildItems(List<Product> products, Random random)
    {
        var items = new List<RemissionGuideItem>();
        foreach (var product in products.OrderBy(_ => random.Next()).Take(1 + random.Next(3)))
        {
            var (description, quantity, weight) = product.Category switch
            {
                ProductCategory.Glass => GlassItem(product, random),
                ProductCategory.Aluminum when product.UnitOfMeasure == "M2" => AreaItem(product.Name, "anodizado natural", random, 6, 9),
                ProductCategory.Aluminum => UnitItem(product.Name, random, 4, 40, 12, 45),
                _ when product.UnitOfMeasure == "M2" => AreaItem(product.Name, Finishes[random.Next(Finishes.Length)], random, 4, 7),
                _ => UnitItem(product.Name, random, 10, 80, 2, 6)
            };
            items.Add(new RemissionGuideItem
            {
                ProductId = product.Id,
                Description = description,
                Quantity = quantity,
                UnitOfMeasure = product.UnitOfMeasure,
                WeightKg = weight
            });
        }
        return items;
    }

    private static (string, decimal, decimal) GlassItem(Product product, Random random)
    {
        int[] thicknesses = [6, 8, 10, 12];
        var thickness = thicknesses[random.Next(thicknesses.Length)];
        var width = 0.9m + random.Next(8) * 0.15m;
        var height = 1.8m + random.Next(6) * 0.2m;
        var area = Math.Round(8m + random.Next(52), 2);
        // El vidrio pesa unos 2.5 kg por m² y por milímetro de espesor.
        var weight = Math.Round(area * thickness * 2.5m, 2);
        var tone = random.Next(3) == 0 ? "gris" : "incoloro";
        return ($"{product.Name} {tone} {thickness} mm, {width:0.00} x {height:0.00} m", area, weight);
    }

    private static (string, decimal, decimal) AreaItem(string name, string finish, Random random, int minKgPerM2, int maxKgPerM2)
    {
        var area = Math.Round(15m + random.Next(90), 2);
        return ($"{name}, {finish}", area, Math.Round(area * random.Next(minKgPerM2, maxKgPerM2 + 1), 2));
    }

    private static (string, decimal, decimal) UnitItem(string name, Random random, int minQty, int maxQty, int minKg, int maxKg)
    {
        var quantity = random.Next(minQty, maxQty + 1);
        return ($"{name}", quantity, Math.Round(quantity * (decimal)(minKg + random.NextDouble() * (maxKg - minKg)), 2));
    }

    private static readonly string[] Finishes = ["color plata", "negro mate", "champagne", "blanco"];

    private static readonly string[] Notes =
    [
        "Manipular con cuidado: vidrio templado. Transportar en caballete.",
        "Entregar en almacén de obra con guía firmada por el residente.",
        "Descarga con grúa del cliente; coordinar 24 h antes.",
        "Ingreso por portón lateral; horario de recepción 8:00 a 16:00."
    ];

    private static readonly (string Company, string Legal, string Ruc, string First, string Last, string Phone, string Address, string District)[] DemoClients =
    [
        ("Inmobiliaria Los Álamos", "Inmobiliaria Los Álamos S.A.C.", "20990000011", "Carla", "Mendoza Ruiz", "987100201", "Av. Javier Prado Este 4120", "Santiago de Surco"),
        ("Constructora Pacífico Sur", "Constructora Pacífico Sur S.A.", "20990000029", "Jorge", "Huamán Lazo", "987100202", "Calle Las Begonias 415", "San Isidro"),
        ("Edifica Andes", "Edifica Andes S.A.C.", "20990000037", "Lucía", "Paredes Soto", "987100203", "Av. Benavides 1555", "Miraflores"),
        ("Grupo Inmobiliario Costa Verde", "Grupo Inmobiliario Costa Verde S.A.C.", "20990000045", "Martín", "Chávez Rojas", "987100204", "Jr. Domeyer 230", "Barranco"),
        ("Torres del Sol Proyectos", "Torres del Sol Proyectos S.A.C.", "20990000053", "Ana", "Vargas Quispe", "987100205", "Av. La Molina 1200", "La Molina"),
        ("Constructora Lima Norte", "Constructora Lima Norte E.I.R.L.", "20990000061", "Pedro", "Salas Ortiz", "987100206", "Av. Alfredo Mendiola 3698", "Independencia"),
        ("Altura Desarrollos", "Altura Desarrollos Inmobiliarios S.A.C.", "20990000079", "Rocío", "Gutiérrez León", "987100207", "Av. Salaverry 2450", "San Isidro"),
        ("Vidrios y Fachadas del Centro", "Vidrios y Fachadas del Centro S.R.L.", "20990000087", "Hugo", "Medina Flores", "987100208", "Av. Nicolás de Piérola 980", "Cercado de Lima"),
        ("Inversiones Mirador", "Inversiones Mirador S.A.C.", "20990000095", "Patricia", "Ramos Díaz", "987100209", "Av. La Marina 2355", "San Miguel"),
        ("Proyecta Hogar", "Proyecta Hogar S.A.C.", "20990000109", "Fernando", "Castro Peña", "987100210", "Av. Canadá 3410", "San Luis"),
        ("Clínica Santa Elena", "Servicios Médicos Santa Elena S.A.", "20990000117", "Sofía", "Núñez Arce", "987100211", "Av. Arequipa 3520", "Lince"),
        ("Colegio Los Pinos", "Asociación Educativa Los Pinos", "20990000125", "Ricardo", "Delgado Ibarra", "987100212", "Calle Los Pinos 145", "Chorrillos")
    ];

    private static readonly (string Name, string? Company, string Email, string Phone, string Message)[] ContactRequests =
    [
        ("Valeria Campos Rivas", "Constructora Altamar S.A.C.", "vcampos@altamar.example", "987 451 220", "Buenas tardes, requerimos cotización de muro cortina con vidrio Low-E para un edificio de oficinas de 12 pisos en San Isidro."),
        ("Andrés Pacheco León", null, "andres.pacheco@correo.example", "956 330 118", "Quisiera información sobre ventanas proyectantes VPR 042 para una vivienda en La Molina. ¿Realizan visita técnica?"),
        ("Gabriela Ortiz Mendoza", "Inmobiliaria Brisa Mar", "gortiz@brisamar.example", "998 210 734", "Necesitamos vidrio laminado para barandas en 40 departamentos. ¿Cuáles son los plazos de entrega?"),
        ("Luis Fernando Rojas", "Clínica San Gabriel", "logistica@sangabriel.example", "(01) 445 2210", "Solicitamos una propuesta para mamparas de vidrio templado en la ampliación del área de consultorios."),
        ("Mariela Sánchez Tello", "Arquitectura MST", "mariela@mst.example", "945 118 902", "Estoy especificando panel de aluminio compuesto para una fachada comercial. ¿Tienen fichas técnicas y muestras de colores?"),
        ("Jorge Luis Calderón", null, "jcalderon@correo.example", "912 664 507", "Deseo cotizar espejos a medida para un gimnasio de 300 m²."),
        ("Patricia Núñez Vela", "Colegio Santa Rosa", "administracion@santarosa.example", "(01) 251 8840", "Necesitamos reemplazar ventanas en tres pabellones durante las vacaciones escolares."),
        ("Ernesto Villanueva", "Hotel Miraflores Park", "compras@mirafloreshotel.example", "999 104 553", "Requerimos puertas de ducha en vidrio templado para 60 habitaciones.")
    ];

    private static IEnumerable<BlogPost> BlogPosts(int authorId)
    {
        BlogPost Post(string title, string category, string art, int daysAgo, string summary, string content) => new()
        {
            Title = title,
            Slug = Slug.From(title),
            Category = category,
            CoverArt = art,
            Summary = summary,
            Content = content,
            IsPublished = true,
            PublishedAt = DateTime.UtcNow.AddDays(-daysAgo),
            CreatedAt = DateTime.UtcNow.AddDays(-daysAgo - 1),
            AuthorId = authorId
        };

        yield return Post(
            "Cómo elegir el vidrio para fachadas en Lima", "Sostenibilidad", "tower", 6,
            "Criterios para escoger entre vidrio templado, laminado, insulado y Low-E según el clima y el uso del edificio.",
            """
            La fachada define el confort térmico, acústico y la seguridad de un edificio. Elegir bien el vidrio desde el diseño evita sobrecostos en climatización y mantenimiento.

            ## Factores a evaluar

            - Radiación solar y orientación de cada fachada
            - Ruido del entorno, sobre todo en avenidas principales
            - Seguridad ante impactos y caídas
            - Requisitos de certificaciones como LEED o EDGE

            ## Recomendaciones para Lima

            En fachadas con alta exposición al sol de la tarde, el vidrio Low-E con control solar reduce la carga de aire acondicionado sin sacrificar la luz natural. Para barandas y zonas de tránsito, el vidrio laminado mantiene los fragmentos adheridos en caso de rotura.

            Nuestro equipo técnico puede ayudarte a definir la combinación adecuada para tu proyecto.
            """);

        yield return Post(
            "Mantenimiento de ventanas de aluminio: guía práctica", "Diseño", "window", 14,
            "Buenas prácticas para conservar la hermeticidad y el acabado de las ventanas de aluminio durante años.",
            """
            Una ventana de aluminio bien mantenida conserva su hermeticidad, su funcionamiento y su apariencia por mucho tiempo. Bastan unos cuidados periódicos.

            ## Limpieza

            - Usa agua tibia con jabón neutro y un paño suave
            - Evita productos abrasivos o con solventes que dañen el anodizado
            - Limpia los rieles de las ventanas corredizas para retirar polvo y arena

            ## Revisión anual

            Revisa los burletes y sellos: si están resecos o agrietados, conviene reemplazarlos para mantener el aislamiento. Verifica también que las bisagras y los cierres de las ventanas proyectantes funcionen sin esfuerzo.
            """);
    }
}
