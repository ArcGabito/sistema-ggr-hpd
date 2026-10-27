using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;
using Server.Services;

namespace Server.Controllers;

[ApiController]
[Authorize]
[Route("api/dispatches")]
public class DispatchesController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<DispatchResponse>> GetAll(
        [FromQuery] DispatchStatus? status,
        CancellationToken cancellationToken)
    {
        var query = DispatchQuery();
        if (status is not null)
        {
            query = query.Where(d => d.Status == status);
        }

        var items = await query
            .OrderByDescending(d => d.ScheduledAt)
            .Take(100)
            .ToListAsync(cancellationToken);

        return items.Select(d => d.ToResponse()).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DispatchResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var dispatch = await DispatchQuery().FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
        return dispatch is null ? NotFound() : dispatch.ToResponse();
    }

    [HttpPost]
    public async Task<ActionResult<DispatchResponse>> Create(CreateDispatchRequest request, CancellationToken cancellationToken)
    {
        var vehicle = await context.Vehicles.FirstOrDefaultAsync(v => v.Id == request.VehicleId && v.IsActive, cancellationToken);
        if (vehicle is null)
        {
            return ValidationError(nameof(request.VehicleId), "El vehículo no existe o está inactivo.");
        }

        if (!await context.Drivers.AnyAsync(d => d.Id == request.DriverId && d.IsActive, cancellationToken))
        {
            return ValidationError(nameof(request.DriverId), "El conductor no existe o está inactivo.");
        }

        if (!await context.Sites.AnyAsync(s => s.Id == request.SiteId && s.IsActive, cancellationToken))
        {
            return ValidationError(nameof(request.SiteId), "La sede no existe.");
        }

        var busy = await context.Dispatches.AnyAsync(d =>
            (d.VehicleId == request.VehicleId || d.DriverId == request.DriverId) &&
            (d.Status == DispatchStatus.Loading || d.Status == DispatchStatus.InTransit), cancellationToken);
        if (busy)
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, title: "El vehículo o el conductor ya están en un despacho en curso.");
        }

        var guideIds = request.GuideIds.Distinct().ToList();
        var guides = await context.RemissionGuides
            .Where(g => guideIds.Contains(g.Id))
            .ToListAsync(cancellationToken);

        if (guides.Count != guideIds.Count || guides.Any(g => g.Status != RemissionGuideStatus.Issued || g.DispatchId != null))
        {
            return ValidationError(nameof(request.GuideIds), "Solo se pueden asignar guías emitidas y sin despacho.");
        }

        if (guides.Any(g => g.OriginSiteId != request.SiteId))
        {
            return ValidationError(nameof(request.GuideIds), "Todas las guías deben partir de la sede del despacho.");
        }

        var totalWeight = guides.Sum(g => g.TotalWeightKg);
        if (totalWeight > vehicle.CapacityKg)
        {
            return ValidationError(nameof(request.GuideIds), $"El peso total ({totalWeight:N0} kg) supera la capacidad del vehículo ({vehicle.CapacityKg:N0} kg).");
        }

        var scheduledAt = request.ScheduledAt.ToUniversalTime();
        var prefix = $"DSP-{scheduledAt:yyMMdd}-";
        var sameDay = await context.Dispatches.CountAsync(d => d.Code.StartsWith(prefix), cancellationToken);

        var dispatch = new Dispatch
        {
            Code = $"{prefix}{sameDay + 1:D3}",
            SiteId = request.SiteId,
            VehicleId = request.VehicleId,
            DriverId = request.DriverId,
            ScheduledAt = scheduledAt,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedById = User.GetUserId(),
            Guides = guides
        };

        context.Dispatches.Add(dispatch);
        await context.SaveChangesAsync(cancellationToken);

        var created = await DispatchQuery().FirstAsync(d => d.Id == dispatch.Id, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = dispatch.Id }, created.ToResponse());
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<DispatchResponse>> UpdateStatus(int id, UpdateDispatchStatusRequest request, CancellationToken cancellationToken)
    {
        var dispatch = await context.Dispatches
            .Include(d => d.Guides)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
        if (dispatch is null)
        {
            return NotFound();
        }

        var allowed = (dispatch.Status, request.Status) switch
        {
            (DispatchStatus.Scheduled, DispatchStatus.Loading) => true,
            (DispatchStatus.Loading, DispatchStatus.InTransit) => dispatch.Guides.Count > 0,
            (DispatchStatus.InTransit, DispatchStatus.Completed) => true,
            (DispatchStatus.Scheduled or DispatchStatus.Loading, DispatchStatus.Cancelled) => true,
            _ => false
        };

        if (!allowed)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Cambio de estado no permitido.",
                detail: $"No se puede pasar de {dispatch.Status} a {request.Status}.");
        }

        var now = DateTime.UtcNow;
        dispatch.Status = request.Status;
        switch (request.Status)
        {
            case DispatchStatus.InTransit:
                dispatch.DepartedAt = now;
                SetGuidesStatus(dispatch, RemissionGuideStatus.InTransit, now);
                break;
            case DispatchStatus.Completed:
                dispatch.CompletedAt = now;
                SetGuidesStatus(dispatch, RemissionGuideStatus.Delivered, now);
                break;
            case DispatchStatus.Cancelled:
                // Las guías se liberan para poder asignarse a otro despacho.
                foreach (var guide in dispatch.Guides)
                {
                    guide.DispatchId = null;
                    guide.UpdatedAt = now;
                }
                dispatch.Guides.Clear();
                break;
        }

        await context.SaveChangesAsync(cancellationToken);

        var updated = await DispatchQuery().FirstAsync(d => d.Id == id, cancellationToken);
        return updated.ToResponse();
    }

    private static void SetGuidesStatus(Dispatch dispatch, RemissionGuideStatus status, DateTime now)
    {
        foreach (var guide in dispatch.Guides)
        {
            guide.Status = status;
            guide.UpdatedAt = now;
        }
    }

    private IQueryable<Dispatch> DispatchQuery() =>
        context.Dispatches
            .AsNoTracking()
            .Include(d => d.Site)
            .Include(d => d.Vehicle)
            .Include(d => d.Driver)
            .Include(d => d.Guides).ThenInclude(g => g.Client)
            .Include(d => d.Guides).ThenInclude(g => g.OriginSite)
            .AsSplitQuery();

    private ActionResult ValidationError(string field, string message)
    {
        ModelState.AddModelError(field, message);
        return ValidationProblem(ModelState);
    }
}
