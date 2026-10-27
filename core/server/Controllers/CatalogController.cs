using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;

namespace Server.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class CatalogController(AppDbContext context) : ControllerBase
{
    [HttpGet("clients")]
    public async Task<PagedResponse<ClientResponse>> GetClients(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = context.Clients.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(c =>
                (c.CompanyName != null && c.CompanyName.Contains(term)) ||
                (c.LegalName != null && c.LegalName.Contains(term)) ||
                (c.TaxId != null && c.TaxId.StartsWith(term)));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(c => c.CompanyName ?? c.LegalName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResponse<ClientResponse>(items.Select(c => c.ToResponse()).ToList(), page, pageSize, total);
    }

    [HttpGet("clients/{id:int}")]
    public async Task<ActionResult<ClientResponse>> GetClient(int id, CancellationToken cancellationToken)
    {
        var client = await context.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        return client is null ? NotFound() : client.ToResponse();
    }

    [HttpGet("sites")]
    public async Task<IReadOnlyList<SiteResponse>> GetSites(CancellationToken cancellationToken) =>
        (await context.Sites.AsNoTracking().Where(s => s.IsActive).OrderBy(s => s.Id).ToListAsync(cancellationToken))
            .Select(s => s.ToResponse()).ToList();

    [HttpGet("products")]
    public async Task<IReadOnlyList<ProductResponse>> GetProducts(CancellationToken cancellationToken) =>
        (await context.Products.AsNoTracking().Where(p => p.IsActive).OrderBy(p => p.Category).ThenBy(p => p.Name).ToListAsync(cancellationToken))
            .Select(p => p.ToResponse()).ToList();
}
