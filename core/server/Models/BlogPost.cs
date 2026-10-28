namespace Server.Models;

public class BlogPost
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Summary { get; set; }
    /// <summary>Texto del artículo: párrafos separados por línea en blanco, "## " para subtítulos y "- " para listas.</summary>
    public string? Content { get; set; }
    public required string Category { get; set; }
    public string CoverArt { get; set; } = "curtain";
    /// <summary>Si existe, el artículo se publica en otro sitio y el blog solo enlaza a él.</summary>
    public string? ExternalUrl { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int? AuthorId { get; set; }
    public User? Author { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
