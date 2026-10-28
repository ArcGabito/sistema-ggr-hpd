using System.ComponentModel.DataAnnotations;

namespace Server.Dtos;

public record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public record ClientResponse(
    int Id,
    string DisplayName,
    string? LegalName,
    string? TaxId,
    string? ContactName,
    string? PhoneNumber,
    string? Email,
    string? Address,
    string? District,
    string? Province);

public record SiteResponse(int Id, string Code, string Name, string Type, string Address, string District, string Province);

public record ProductResponse(int Id, string Code, string Name, string? Description, string Category, string UnitOfMeasure);

public record VehicleResponse(int Id, string Plate, string Brand, string Model, decimal CapacityKg, bool IsActive);

public record DriverResponse(int Id, string FullName, string DocumentNumber, string LicenseNumber, string? PhoneNumber, bool IsActive);

public record CreateVehicleRequest(
    [Required, RegularExpression("^[A-Z0-9]{3}-[A-Z0-9]{3}$")] string Plate,
    [Required, MaxLength(60)] string Brand,
    [Required, MaxLength(60)] string Model,
    [Range(100, 60000)] decimal CapacityKg);

public record CreateDriverRequest(
    [Required, MaxLength(120)] string FullName,
    [Required, RegularExpression("^[0-9]{8}$")] string DocumentNumber,
    [Required, MaxLength(20)] string LicenseNumber,
    [RegularExpression("^9[0-9]{8}$")] string? PhoneNumber);

public record ContactRequestDto(
    [Required, MinLength(3), MaxLength(120)] string FullName,
    [MaxLength(150)] string? Company,
    [Required, EmailAddress, MaxLength(160)] string Email,
    [Required, RegularExpression("^\\+?[0-9 ]{7,15}$")] string PhoneNumber,
    [Required, MinLength(10), MaxLength(1000)] string Message);
