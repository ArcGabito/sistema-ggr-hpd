namespace Server.Models;

public class Driver
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string DocumentNumber { get; set; }
    public required string LicenseNumber { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
}
