using Server.Models;

namespace Server.Data;

public static class CatalogSeedData
{
    public static IReadOnlyList<Site> Sites =>
    [
        new Site
        {
            Code = "CHO",
            Name = "Oficina principal, almacén y distribución",
            Type = SiteType.Headquarters,
            Address = "Ca. Arquímedes Mz. B1 Lt. 15, Urb. La Campiña",
            District = "Chorrillos",
            Province = "Lima"
        },
        new Site
        {
            Code = "LVI",
            Name = "Ventas sector distribución",
            Type = SiteType.Sales,
            Address = "Av. México N° 554, Urb. Balconcillo",
            District = "La Victoria",
            Province = "Lima"
        },
        new Site
        {
            Code = "CHI",
            Name = "Centro de procesamiento principal",
            Type = SiteType.ProcessingPlant,
            Address = "Los Huertos de Oro de San Hilarión Mz. B1 Lt. 3",
            District = "Chilca",
            Province = "Cañete"
        }
    ];

    public static IReadOnlyList<Product> Products =>
    [
        new Product { Code = "VID-TEM", Name = "Vidrio templado", Description = "Calidad y alta resistencia en cada proyecto.", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "VID-TER", Name = "Vidrio termoendurecido", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "VID-LAM", Name = "Vidrio laminado", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "VID-INS", Name = "Vidrio insulado", Description = "Mayor aislamiento térmico y acústico.", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "VID-CSO", Name = "Vidrio de control solar", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "VID-LOE", Name = "Vidrio Low-E", Description = "Eficiencia energética y confort térmico.", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "VID-PRI", Name = "Vidrio primario", Category = ProductCategory.Glass, UnitOfMeasure = "M2" },
        new Product { Code = "ALU-PCO", Name = "Perfiles convencionales", Description = "Durabilidad y resistencia para cada proyecto.", Category = ProductCategory.Aluminum, UnitOfMeasure = "UND" },
        new Product { Code = "ALU-VPR042", Name = "Ventana proyectante VPR 042", Description = "Confort en proyectos exigentes.", Category = ProductCategory.Aluminum, UnitOfMeasure = "UND" },
        new Product { Code = "ALU-VPR036", Name = "Ventana proyectante VPR 036", Description = "Hermeticidad y funcionalidad con apertura controlada.", Category = ProductCategory.Aluminum, UnitOfMeasure = "UND" },
        new Product { Code = "ALU-VCO043", Name = "Ventana corrediza VCO 043", Description = "Corredizo robusto, térmico y versátil.", Category = ProductCategory.Aluminum, UnitOfMeasure = "UND" },
        new Product { Code = "ALU-MCO", Name = "Sistema de muro cortina", Category = ProductCategory.Aluminum, UnitOfMeasure = "M2" },
        new Product { Code = "ALU-SCA", Name = "Serie de carpintería de aluminio", Category = ProductCategory.Aluminum, UnitOfMeasure = "UND" },
        new Product { Code = "DEC-PAC", Name = "Panel de aluminio compuesto (PAC)", Description = "Diseño contemporáneo y desempeño superior.", Category = ProductCategory.Decorative, UnitOfMeasure = "M2" },
        new Product { Code = "DEC-LAM", Name = "Lamas de aluminio", Category = ProductCategory.Decorative, UnitOfMeasure = "UND" },
        new Product { Code = "DEC-GPL", Name = "Gres porcelánico laminado", Category = ProductCategory.Decorative, UnitOfMeasure = "M2" },
        new Product { Code = "DEC-MVE", Name = "Muro verde", Category = ProductCategory.Decorative, UnitOfMeasure = "M2" },
        new Product { Code = "DEC-ESP", Name = "Espejo", Category = ProductCategory.Decorative, UnitOfMeasure = "M2" }
    ];

    public static IReadOnlyList<Vehicle> Vehicles =>
    [
        new Vehicle { Plate = "BXK-721", Brand = "Hino", Model = "Serie 500 GH", CapacityKg = 10000 },
        new Vehicle { Plate = "C3M-458", Brand = "Isuzu", Model = "FVR 34", CapacityKg = 8000 },
        new Vehicle { Plate = "D7T-903", Brand = "Volvo", Model = "FH 460", CapacityKg = 28000 }
    ];

    public static IReadOnlyList<Driver> Drivers =>
    [
        new Driver { FullName = "Carlos Quispe Huamán", DocumentNumber = "45872136", LicenseNumber = "Q45872136", PhoneNumber = "987654321" },
        new Driver { FullName = "Jorge Ramírez Torres", DocumentNumber = "41236598", LicenseNumber = "R41236598", PhoneNumber = "976543210" },
        new Driver { FullName = "Luis Mendoza Paredes", DocumentNumber = "47785412", LicenseNumber = "M47785412", PhoneNumber = "965432109" }
    ];
}
