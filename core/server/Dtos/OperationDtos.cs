using System.ComponentModel.DataAnnotations;
using Server.Models;

namespace Server.Dtos;

public record RemissionGuideItemRequest(
    [Range(1, int.MaxValue)] int ProductId,
    [MaxLength(250)] string? Description,
    [Range(0.001, 1_000_000)] decimal Quantity,
    [Range(0, 100_000)] decimal WeightKg);

public record CreateRemissionGuideRequest(
    [Range(1, int.MaxValue)] int ClientId,
    [Range(1, int.MaxValue)] int OriginSiteId,
    [Required, MinLength(5), MaxLength(250)] string DeliveryAddress,
    DateTime TransferDate,
    TransferReason TransferReason,
    [MaxLength(500)] string? Notes,
    [Required, MinLength(1), MaxLength(50)] List<RemissionGuideItemRequest> Items);

public record UpdateGuideStatusRequest(RemissionGuideStatus Status);

public record RemissionGuideItemResponse(int Id, int ProductId, string ProductCode, string Description, decimal Quantity, string UnitOfMeasure, decimal WeightKg);

public record RemissionGuideSummary(
    int Id,
    string Number,
    DateTime IssueDate,
    DateTime TransferDate,
    string Status,
    string TransferReason,
    string ClientName,
    string? ClientTaxId,
    string OriginSite,
    string DeliveryAddress,
    decimal TotalWeightKg,
    string? DispatchCode);

public record RemissionGuideDetail(
    int Id,
    string Number,
    DateTime IssueDate,
    DateTime TransferDate,
    string Status,
    string TransferReason,
    ClientResponse Client,
    SiteResponse OriginSite,
    string DeliveryAddress,
    decimal TotalWeightKg,
    string? Notes,
    string? DispatchCode,
    string? VehiclePlate,
    string? DriverName,
    string CreatedBy,
    IReadOnlyList<RemissionGuideItemResponse> Items);

public record CreateDispatchRequest(
    [Range(1, int.MaxValue)] int SiteId,
    [Range(1, int.MaxValue)] int VehicleId,
    [Range(1, int.MaxValue)] int DriverId,
    DateTime ScheduledAt,
    [MaxLength(500)] string? Notes,
    List<int> GuideIds);

public record UpdateDispatchStatusRequest(DispatchStatus Status);

public record DispatchResponse(
    int Id,
    string Code,
    string Status,
    string Site,
    string VehiclePlate,
    string DriverName,
    DateTime ScheduledAt,
    DateTime? DepartedAt,
    DateTime? CompletedAt,
    string? Notes,
    decimal TotalWeightKg,
    decimal VehicleCapacityKg,
    IReadOnlyList<RemissionGuideSummary> Guides);

public record DashboardSummary(
    int GuidesToday,
    int GuidesDraft,
    int GuidesIssuedPending,
    int GuidesInTransit,
    int GuidesDeliveredMonth,
    int DispatchesScheduled,
    int DispatchesInProgress,
    int ClientsCount,
    IReadOnlyList<RemissionGuideSummary> RecentGuides,
    IReadOnlyList<DispatchResponse> UpcomingDispatches);
