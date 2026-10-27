namespace Server.Models;

public class Vehicle
{
    public int Id { get; set; }
    public required string Plate { get; set; }
    public required string Brand { get; set; }
    public required string Model { get; set; }
    public decimal CapacityKg { get; set; }
    public bool IsActive { get; set; } = true;
}
