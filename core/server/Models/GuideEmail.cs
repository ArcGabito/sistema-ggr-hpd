namespace Server.Models;

/// <summary>Registro de cada envío de una guía de remisión por correo.</summary>
public class GuideEmail
{
    public int Id { get; set; }
    public int RemissionGuideId { get; set; }
    public RemissionGuide? RemissionGuide { get; set; }
    public required string To { get; set; }
    public string? Cc { get; set; }
    public required string Subject { get; set; }
    public string? InvoiceFileName { get; set; }
    public bool Succeeded { get; set; }
    public string? Error { get; set; }
    public int SentById { get; set; }
    public User? SentBy { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
