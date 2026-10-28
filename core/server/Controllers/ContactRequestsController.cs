using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

[ApiController]
// Contienen datos personales de quienes escriben desde el sitio: no los ve el rol Operador.
[Authorize(Roles = "Admin,Supervisor")]
[Route("api/contact-requests")]
public class ContactRequestsController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResponse<ContactRequestResponse>> GetAll(
        [FromQuery] bool? attended,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = context.ContactRequests.AsNoTracking();
        if (attended is not null) query = query.Where(c => c.IsAttended == attended);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(c => c.IsAttended)
            .ThenByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResponse<ContactRequestResponse>(items.Select(ToResponse).ToList(), page, pageSize, total);
    }

    [HttpPatch("{id:int}")]
    public async Task<ActionResult<ContactRequestResponse>> Update(int id, UpdateContactRequest request, CancellationToken cancellationToken)
    {
        var item = await context.ContactRequests.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (item is null) return NotFound();

        item.IsAttended = request.IsAttended;
        await context.SaveChangesAsync(cancellationToken);
        return ToResponse(item);
    }

    private static ContactRequestResponse ToResponse(ContactRequest c) =>
        new(c.Id, c.FullName, c.Company, c.Email, c.PhoneNumber, c.Message, c.CreatedAt, c.IsAttended);
}
