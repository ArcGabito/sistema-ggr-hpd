using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController(AppDbContext context) : ControllerBase
{
    // Perú no aplica horario de verano: UTC-5 todo el año.
    private static readonly TimeSpan LimaOffset = TimeSpan.FromHours(-5);

    [HttpGet("summary")]
    public async Task<DashboardSummary> GetSummary(CancellationToken cancellationToken)
    {
        var limaNow = DateTime.UtcNow + LimaOffset;
        var todayStartUtc = limaNow.Date - LimaOffset;
        var monthStartUtc = new DateTime(limaNow.Year, limaNow.Month, 1, 0, 0, 0, DateTimeKind.Utc) - LimaOffset;

        var guides = context.RemissionGuides.AsNoTracking();
        var dispatches = context.Dispatches.AsNoTracking();

        var recentGuides = await guides
            .Include(g => g.Client)
            .Include(g => g.OriginSite)
            .Include(g => g.Dispatch)
            .OrderByDescending(g => g.CreatedAt)
            .Take(6)
            .ToListAsync(cancellationToken);

        var upcoming = await dispatches
            .Include(d => d.Site)
            .Include(d => d.Vehicle)
            .Include(d => d.Driver)
            .Include(d => d.Guides).ThenInclude(g => g.Client)
            .Where(d => d.Status == DispatchStatus.Scheduled || d.Status == DispatchStatus.Loading || d.Status == DispatchStatus.InTransit)
            .OrderBy(d => d.ScheduledAt)
            .Take(5)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        return new DashboardSummary(
            GuidesToday: await guides.CountAsync(g => g.IssueDate >= todayStartUtc, cancellationToken),
            GuidesDraft: await guides.CountAsync(g => g.Status == RemissionGuideStatus.Draft, cancellationToken),
            GuidesIssuedPending: await guides.CountAsync(g => g.Status == RemissionGuideStatus.Issued && g.DispatchId == null, cancellationToken),
            GuidesInTransit: await guides.CountAsync(g => g.Status == RemissionGuideStatus.InTransit, cancellationToken),
            GuidesDeliveredMonth: await guides.CountAsync(g => g.Status == RemissionGuideStatus.Delivered && g.UpdatedAt >= monthStartUtc, cancellationToken),
            DispatchesScheduled: await dispatches.CountAsync(d => d.Status == DispatchStatus.Scheduled, cancellationToken),
            DispatchesInProgress: await dispatches.CountAsync(d => d.Status == DispatchStatus.Loading || d.Status == DispatchStatus.InTransit, cancellationToken),
            ClientsCount: await context.Clients.CountAsync(cancellationToken),
            RecentGuides: recentGuides.Select(g => g.ToSummary()).ToList(),
            UpcomingDispatches: upcoming.Select(d => d.ToResponse()).ToList());
    }
}
