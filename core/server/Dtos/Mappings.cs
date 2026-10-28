using Server.Models;

namespace Server.Dtos;

public static class Mappings
{
    public static ClientResponse ToResponse(this Client c) => new(
        c.Id,
        c.DisplayName,
        c.LegalName,
        c.TaxId,
        string.Join(' ', new[] { c.FirstName, c.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))) is { Length: > 0 } name ? name : null,
        c.PhoneNumber,
        c.Email,
        c.Address,
        c.District,
        c.Province);

    public static SiteResponse ToResponse(this Site s) =>
        new(s.Id, s.Code, s.Name, s.Type.ToString(), s.Address, s.District, s.Province);

    public static ProductResponse ToResponse(this Product p) =>
        new(p.Id, p.Code, p.Name, p.Description, p.Category.ToString(), p.UnitOfMeasure);

    public static VehicleResponse ToResponse(this Vehicle v) =>
        new(v.Id, v.Plate, v.Brand, v.Model, v.CapacityKg, v.IsActive);

    public static DriverResponse ToResponse(this Driver d) =>
        new(d.Id, d.FullName, d.DocumentNumber, d.LicenseNumber, d.PhoneNumber, d.IsActive);

    public static RemissionGuideSummary ToSummary(this RemissionGuide g) => new(
        g.Id,
        g.FullNumber,
        g.IssueDate,
        g.TransferDate,
        g.Status.ToString(),
        g.TransferReason.ToString(),
        g.Client?.DisplayName ?? string.Empty,
        g.Client?.TaxId,
        g.OriginSite?.Name ?? string.Empty,
        g.DeliveryAddress,
        g.TotalWeightKg,
        g.Dispatch?.Code);

    public static RemissionGuideDetail ToDetail(this RemissionGuide g) => new(
        g.Id,
        g.FullNumber,
        g.IssueDate,
        g.TransferDate,
        g.Status.ToString(),
        g.TransferReason.ToString(),
        g.Client!.ToResponse(),
        g.OriginSite!.ToResponse(),
        g.DeliveryAddress,
        g.TotalWeightKg,
        g.Notes,
        g.Dispatch?.Code,
        g.Dispatch?.Vehicle?.Plate,
        g.Dispatch?.Driver?.FullName,
        g.CreatedBy?.FullName ?? string.Empty,
        g.Items.Select(i => new RemissionGuideItemResponse(
            i.Id, i.ProductId, i.Product?.Code ?? string.Empty, i.Description, i.Quantity, i.UnitOfMeasure, i.WeightKg)).ToList());

    public static DispatchResponse ToResponse(this Dispatch d) => new(
        d.Id,
        d.Code,
        d.Status.ToString(),
        d.Site?.Name ?? string.Empty,
        d.Vehicle?.Plate ?? string.Empty,
        d.Driver?.FullName ?? string.Empty,
        d.ScheduledAt,
        d.DepartedAt,
        d.CompletedAt,
        d.Notes,
        d.Guides.Sum(g => g.TotalWeightKg),
        d.Vehicle?.CapacityKg ?? 0,
        d.Guides.Select(g => g.ToSummary()).ToList());
}
