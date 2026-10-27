namespace Server.Models;

public class Dispatch
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public DispatchStatus Status { get; set; } = DispatchStatus.Scheduled;

    public int SiteId { get; set; }
    public Site? Site { get; set; }

    public int VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public int DriverId { get; set; }
    public Driver? Driver { get; set; }

    public DateTime ScheduledAt { get; set; }
    public DateTime? DepartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }

    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<RemissionGuide> Guides { get; set; } = [];
}
