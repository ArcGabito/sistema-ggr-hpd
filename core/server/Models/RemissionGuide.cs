namespace Server.Models;

public class RemissionGuide
{
    public int Id { get; set; }
    public string Series { get; set; } = "T001";
    public int Number { get; set; }
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    public DateTime TransferDate { get; set; }
    public TransferReason TransferReason { get; set; } = TransferReason.Sale;
    public RemissionGuideStatus Status { get; set; } = RemissionGuideStatus.Draft;

    public int OriginSiteId { get; set; }
    public Site? OriginSite { get; set; }

    public int ClientId { get; set; }
    public Client? Client { get; set; }

    public required string DeliveryAddress { get; set; }
    public decimal TotalWeightKg { get; set; }
    public string? Notes { get; set; }

    public int? DispatchId { get; set; }
    public Dispatch? Dispatch { get; set; }

    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<RemissionGuideItem> Items { get; set; } = [];

    public string FullNumber => $"{Series}-{Number:D8}";
}
