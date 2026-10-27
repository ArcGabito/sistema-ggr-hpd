using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(AppDbContext context) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    public async Task<IActionResult> Create(ContactRequestDto request, CancellationToken cancellationToken)
    {
        context.ContactRequests.Add(new ContactRequest
        {
            FullName = request.FullName.Trim(),
            Company = string.IsNullOrWhiteSpace(request.Company) ? null : request.Company.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PhoneNumber = request.PhoneNumber.Trim(),
            Message = request.Message.Trim()
        });
        await context.SaveChangesAsync(cancellationToken);
        return Accepted();
    }
}
