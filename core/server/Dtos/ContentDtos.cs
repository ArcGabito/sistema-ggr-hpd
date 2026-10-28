using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Server.Dtos;

public record BlogPostSummary(
    int Id,
    string Title,
    string Slug,
    string Summary,
    string Category,
    string CoverArt,
    string? ExternalUrl,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime? UpdatedAt);

public record BlogPostDetail(
    int Id,
    string Title,
    string Slug,
    string Summary,
    string? Content,
    string Category,
    string CoverArt,
    string? ExternalUrl,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime? UpdatedAt,
    string? AuthorName);

public record SaveBlogPostRequest(
    [Required, MinLength(5), MaxLength(200)] string Title,
    [MaxLength(200), RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$")] string? Slug,
    [Required, MinLength(10), MaxLength(400)] string Summary,
    [MaxLength(50_000)] string? Content,
    [Required, MaxLength(50)] string Category,
    [Required, MaxLength(20)] string CoverArt,
    [MaxLength(400), Url] string? ExternalUrl,
    bool IsPublished);

public record ContactRequestResponse(
    int Id,
    string FullName,
    string? Company,
    string Email,
    string PhoneNumber,
    string Message,
    DateTime CreatedAt,
    bool IsAttended);

public record UpdateContactRequest(bool IsAttended);

public class SendGuideEmailForm
{
    [Required, EmailAddress, MaxLength(320)]
    public string To { get; set; } = string.Empty;

    [EmailAddress, MaxLength(320)]
    public string? Cc { get; set; }

    [MaxLength(1000)]
    public string? Message { get; set; }

    /// <summary>Guarda el destinatario como correo del cliente para próximos envíos.</summary>
    public bool SaveClientEmail { get; set; }

    /// <summary>Factura en PDF emitida por el sistema de facturación (opcional).</summary>
    public IFormFile? Invoice { get; set; }
}

public record GuideEmailResponse(
    int Id,
    string To,
    string? Cc,
    string Subject,
    string? InvoiceFileName,
    bool Succeeded,
    string? Error,
    string SentBy,
    DateTime SentAt);
