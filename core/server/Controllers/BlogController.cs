using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;
using Server.Services;

namespace Server.Controllers;

[ApiController]
public class BlogController(AppDbContext context) : ControllerBase
{
    public static readonly string[] Categories = ["Arquitectura", "Diseño", "Sostenibilidad", "Tendencias", "Noticias"];
    public static readonly string[] CoverArts = ["tower", "curtain", "insulated", "window", "sliding", "panels", "slats", "mirror"];

    // ---------- Sitio público ----------

    [HttpGet("api/blog")]
    [AllowAnonymous]
    public async Task<IReadOnlyList<BlogPostSummary>> GetPublished(CancellationToken cancellationToken) =>
        (await context.BlogPosts.AsNoTracking()
            .Where(p => p.IsPublished)
            .OrderByDescending(p => p.PublishedAt)
            .ToListAsync(cancellationToken))
        .Select(ToSummary).ToList();

    [HttpGet("api/blog/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<BlogPostDetail>> GetPublishedBySlug(string slug, CancellationToken cancellationToken)
    {
        var post = await context.BlogPosts.AsNoTracking().Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished, cancellationToken);
        return post is null ? NotFound() : ToDetail(post);
    }

    // ---------- Administración ----------

    [HttpGet("api/admin/blog")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<IReadOnlyList<BlogPostSummary>> GetAll(CancellationToken cancellationToken) =>
        (await context.BlogPosts.AsNoTracking()
            .OrderByDescending(p => p.IsPublished ? p.PublishedAt : p.CreatedAt)
            .ToListAsync(cancellationToken))
        .Select(ToSummary).ToList();

    [HttpGet("api/admin/blog/{id:int}")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<ActionResult<BlogPostDetail>> GetById(int id, CancellationToken cancellationToken)
    {
        var post = await context.BlogPosts.AsNoTracking().Include(p => p.Author).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        return post is null ? NotFound() : ToDetail(post);
    }

    [HttpPost("api/admin/blog")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<ActionResult<BlogPostDetail>> Create(SaveBlogPostRequest request, CancellationToken cancellationToken)
    {
        var post = new BlogPost { Title = string.Empty, Slug = string.Empty, Summary = string.Empty, Category = string.Empty, AuthorId = User.GetUserId() };
        var error = await ApplyAsync(post, request, cancellationToken);
        if (error is not null) return error;

        context.BlogPosts.Add(post);
        await context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = post.Id }, ToDetail(post));
    }

    [HttpPut("api/admin/blog/{id:int}")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<ActionResult<BlogPostDetail>> Update(int id, SaveBlogPostRequest request, CancellationToken cancellationToken)
    {
        var post = await context.BlogPosts.Include(p => p.Author).FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (post is null) return NotFound();

        var error = await ApplyAsync(post, request, cancellationToken);
        if (error is not null) return error;

        post.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
        return ToDetail(post);
    }

    [HttpDelete("api/admin/blog/{id:int}")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await context.BlogPosts.Where(p => p.Id == id).ExecuteDeleteAsync(cancellationToken);
        return deleted == 0 ? NotFound() : NoContent();
    }

    private async Task<ActionResult?> ApplyAsync(BlogPost post, SaveBlogPostRequest request, CancellationToken cancellationToken)
    {
        if (!Categories.Contains(request.Category)) return ValidationError(nameof(request.Category), "Categoría no válida.");
        if (!CoverArts.Contains(request.CoverArt)) return ValidationError(nameof(request.CoverArt), "Portada no válida.");

        var content = string.IsNullOrWhiteSpace(request.Content) ? null : request.Content.Trim();
        var externalUrl = string.IsNullOrWhiteSpace(request.ExternalUrl) ? null : request.ExternalUrl.Trim();
        if (content is null && externalUrl is null)
        {
            return ValidationError(nameof(request.Content), "Escribe el contenido o indica el enlace a la publicación original.");
        }
        if (externalUrl is not null && !externalUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return ValidationError(nameof(request.ExternalUrl), "El enlace debe empezar con https://.");
        }

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? Slug.From(request.Title) : request.Slug;
        if (slug.Length == 0) return ValidationError(nameof(request.Slug), "No se pudo generar la URL del artículo.");
        if (await context.BlogPosts.AnyAsync(p => p.Slug == slug && p.Id != post.Id, cancellationToken))
        {
            return ValidationError(nameof(request.Slug), "Ya existe un artículo con esa URL.");
        }

        post.Title = request.Title.Trim();
        post.Slug = slug;
        post.Summary = request.Summary.Trim();
        post.Content = content;
        post.Category = request.Category;
        post.CoverArt = request.CoverArt;
        post.ExternalUrl = externalUrl;
        if (request.IsPublished && !post.IsPublished) post.PublishedAt = DateTime.UtcNow;
        post.IsPublished = request.IsPublished;
        return null;
    }

    private ActionResult ValidationError(string field, string message)
    {
        ModelState.AddModelError(field, message);
        return ValidationProblem(ModelState);
    }

    private static BlogPostSummary ToSummary(BlogPost p) =>
        new(p.Id, p.Title, p.Slug, p.Summary, p.Category, p.CoverArt, p.ExternalUrl, p.IsPublished, p.PublishedAt, p.UpdatedAt);

    private static BlogPostDetail ToDetail(BlogPost p) =>
        new(p.Id, p.Title, p.Slug, p.Summary, p.Content, p.Category, p.CoverArt, p.ExternalUrl, p.IsPublished, p.PublishedAt, p.UpdatedAt, p.Author?.FullName);
}
