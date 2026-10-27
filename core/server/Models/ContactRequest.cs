namespace Server.Models;

public class ContactRequest
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public string? Company { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsAttended { get; set; }
}
