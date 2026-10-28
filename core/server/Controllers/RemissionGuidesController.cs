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
[Route("api/remission-guides")]
public class RemissionGuidesController(
    AppDbContext context,
    IGuidePdfGenerator pdfGenerator,
    IEmailSender emailSender,
    ILogger<RemissionGuidesController> logger) : ControllerBase
{
    private const long MaxInvoiceBytes = 10 * 1024 * 1024;

    private const string DefaultSeries = "T001";

    [HttpGet]
    public async Task<PagedResponse<RemissionGuideSummary>> GetAll(
        [FromQuery] RemissionGuideStatus? status,
        [FromQuery] string? search,
        [FromQuery] bool unassigned = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = context.RemissionGuides
            .AsNoTracking()
            .Include(g => g.Client)
            .Include(g => g.OriginSite)
            .Include(g => g.Dispatch)
            .AsQueryable();

        if (status is not null)
        {
            query = query.Where(g => g.Status == status);
        }

        if (unassigned)
        {
            query = query.Where(g => g.DispatchId == null);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var numberTerm = int.TryParse(term.Split('-').Last(), out var parsed) ? parsed : (int?)null;
            query = query.Where(g =>
                (numberTerm != null && g.Number == numberTerm) ||
                (g.Client!.CompanyName != null && g.Client.CompanyName.Contains(term)) ||
                (g.Client!.TaxId != null && g.Client.TaxId.StartsWith(term)) ||
                g.DeliveryAddress.Contains(term));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(g => g.IssueDate)
            .ThenByDescending(g => g.Number)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResponse<RemissionGuideSummary>(items.Select(g => g.ToSummary()).ToList(), page, pageSize, total);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RemissionGuideDetail>> GetById(int id, CancellationToken cancellationToken)
    {
        var guide = await LoadDetailAsync(id, cancellationToken);
        return guide is null ? NotFound() : guide.ToDetail();
    }

    [HttpPost]
    public async Task<ActionResult<RemissionGuideDetail>> Create(CreateRemissionGuideRequest request, CancellationToken cancellationToken)
    {
        if (!await context.Clients.AnyAsync(c => c.Id == request.ClientId, cancellationToken))
        {
            return ValidationError(nameof(request.ClientId), "El cliente no existe.");
        }

        if (!await context.Sites.AnyAsync(s => s.Id == request.OriginSiteId && s.IsActive, cancellationToken))
        {
            return ValidationError(nameof(request.OriginSiteId), "La sede de origen no existe.");
        }

        if (request.TransferDate.ToUniversalTime().Date < DateTime.UtcNow.AddDays(-1).Date)
        {
            return ValidationError(nameof(request.TransferDate), "La fecha de traslado no puede ser anterior a hoy.");
        }

        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await context.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        if (products.Count != productIds.Count)
        {
            return ValidationError(nameof(request.Items), "Uno o más productos no existen.");
        }

        var guide = new RemissionGuide
        {
            Series = DefaultSeries,
            ClientId = request.ClientId,
            OriginSiteId = request.OriginSiteId,
            DeliveryAddress = request.DeliveryAddress.Trim(),
            TransferDate = request.TransferDate.ToUniversalTime(),
            TransferReason = request.TransferReason,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedById = User.GetUserId(),
            Items = request.Items.Select(i => new RemissionGuideItem
            {
                ProductId = i.ProductId,
                Description = string.IsNullOrWhiteSpace(i.Description) ? products[i.ProductId].Name : i.Description.Trim(),
                Quantity = i.Quantity,
                UnitOfMeasure = products[i.ProductId].UnitOfMeasure,
                WeightKg = i.WeightKg
            }).ToList()
        };
        guide.TotalWeightKg = guide.Items.Sum(i => i.WeightKg);

        // El índice único (Series, Number) protege ante numeraciones concurrentes.
        for (var attempt = 1; ; attempt++)
        {
            guide.Number = (await context.RemissionGuides
                .Where(g => g.Series == DefaultSeries)
                .MaxAsync(g => (int?)g.Number, cancellationToken) ?? 0) + 1;
            context.RemissionGuides.Add(guide);
            try
            {
                await context.SaveChangesAsync(cancellationToken);
                break;
            }
            catch (DbUpdateException) when (attempt < 3)
            {
                context.Entry(guide).State = EntityState.Detached;
            }
        }

        var created = await LoadDetailAsync(guide.Id, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = guide.Id }, created!.ToDetail());
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<RemissionGuideDetail>> UpdateStatus(int id, UpdateGuideStatusRequest request, CancellationToken cancellationToken)
    {
        var guide = await context.RemissionGuides.FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
        if (guide is null)
        {
            return NotFound();
        }

        // Los estados En tránsito y Entregada se controlan desde el despacho.
        var allowed = (guide.Status, request.Status) switch
        {
            (RemissionGuideStatus.Draft, RemissionGuideStatus.Issued) => true,
            (RemissionGuideStatus.Draft, RemissionGuideStatus.Cancelled) => true,
            (RemissionGuideStatus.Issued, RemissionGuideStatus.Cancelled) => guide.DispatchId is null,
            _ => false
        };

        if (!allowed)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Cambio de estado no permitido.",
                detail: $"No se puede pasar de {guide.Status} a {request.Status}.");
        }

        guide.Status = request.Status;
        guide.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        return (await LoadDetailAsync(id, cancellationToken))!.ToDetail();
    }

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> DownloadPdf(int id, CancellationToken cancellationToken)
    {
        var guide = await LoadDetailAsync(id, cancellationToken);
        if (guide is null) return NotFound();
        return File(pdfGenerator.Generate(guide), "application/pdf", $"guia-remision-{guide.FullNumber}.pdf");
    }

    [HttpGet("{id:int}/emails")]
    public async Task<IReadOnlyList<GuideEmailResponse>> GetEmails(int id, CancellationToken cancellationToken) =>
        (await context.GuideEmails.AsNoTracking()
            .Include(e => e.SentBy)
            .Where(e => e.RemissionGuideId == id)
            .OrderByDescending(e => e.SentAt)
            .ToListAsync(cancellationToken))
        .Select(e => new GuideEmailResponse(e.Id, e.To, e.Cc, e.Subject, e.InvoiceFileName, e.Succeeded, e.Error, e.SentBy?.FullName ?? string.Empty, e.SentAt))
        .ToList();

    [HttpPost("{id:int}/email")]
    [RequestSizeLimit(12 * 1024 * 1024)]
    public async Task<ActionResult<GuideEmailResponse>> SendEmail(int id, [FromForm] SendGuideEmailForm form, CancellationToken cancellationToken)
    {
        var guide = await LoadDetailAsync(id, cancellationToken);
        if (guide is null) return NotFound();

        if (guide.Status is RemissionGuideStatus.Draft or RemissionGuideStatus.Cancelled)
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, title: "Solo se pueden enviar guías emitidas.");
        }

        var attachments = new List<EmailAttachment>
        {
            new($"guia-remision-{guide.FullNumber}.pdf", pdfGenerator.Generate(guide), "application/pdf")
        };

        string? invoiceName = null;
        if (form.Invoice is { Length: > 0 } invoice)
        {
            if (invoice.Length > MaxInvoiceBytes) return ValidationError(nameof(form.Invoice), "La factura no debe superar los 10 MB.");

            using var buffer = new MemoryStream();
            await invoice.CopyToAsync(buffer, cancellationToken);
            var bytes = buffer.ToArray();
            // Se valida la firma del archivo, no solo la extensión.
            if (bytes.Length < 5 || !bytes.AsSpan(0, 5).SequenceEqual("%PDF-"u8))
            {
                return ValidationError(nameof(form.Invoice), "La factura debe ser un archivo PDF.");
            }

            invoiceName = Path.GetFileName(invoice.FileName);
            if (string.IsNullOrWhiteSpace(invoiceName) || !invoiceName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)) invoiceName = "factura.pdf";
            attachments.Add(new EmailAttachment(invoiceName, bytes, "application/pdf"));
        }

        var to = form.To.Trim().ToLowerInvariant();
        var cc = string.IsNullOrWhiteSpace(form.Cc) ? null : form.Cc.Trim().ToLowerInvariant();
        var subject = GuideEmailComposer.Subject(guide);
        var (html, text) = GuideEmailComposer.Body(guide, form.Message, invoiceName is not null);

        var record = new GuideEmail
        {
            RemissionGuideId = guide.Id,
            To = to,
            Cc = cc,
            Subject = subject,
            InvoiceFileName = invoiceName,
            SentById = User.GetUserId()
        };

        try
        {
            await emailSender.SendAsync(to, cc, subject, html, text, attachments, cancellationToken);
            record.Succeeded = true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError(ex, "No se pudo enviar la guía {Number} a {To}", guide.FullNumber, to);
            record.Error = "El servidor de correo rechazó el envío o no está disponible.";
        }

        context.GuideEmails.Add(record);
        if (record.Succeeded && form.SaveClientEmail)
        {
            await context.Clients.Where(c => c.Id == guide.ClientId)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.Email, to), cancellationToken);
        }
        await context.SaveChangesAsync(cancellationToken);

        if (!record.Succeeded)
        {
            return Problem(statusCode: StatusCodes.Status502BadGateway, title: record.Error);
        }

        var sentBy = await context.Users.Where(u => u.Id == record.SentById).Select(u => u.FullName).FirstAsync(cancellationToken);
        return new GuideEmailResponse(record.Id, record.To, record.Cc, record.Subject, record.InvoiceFileName, true, null, sentBy, record.SentAt);
    }

    private Task<RemissionGuide?> LoadDetailAsync(int id, CancellationToken cancellationToken) =>
        context.RemissionGuides
            .AsNoTracking()
            .Include(g => g.Client)
            .Include(g => g.OriginSite)
            .Include(g => g.CreatedBy)
            .Include(g => g.Items).ThenInclude(i => i.Product)
            .Include(g => g.Dispatch).ThenInclude(d => d!.Vehicle)
            .Include(g => g.Dispatch).ThenInclude(d => d!.Driver)
            .AsSplitQuery()
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);

    private ActionResult ValidationError(string field, string message)
    {
        ModelState.AddModelError(field, message);
        return ValidationProblem(ModelState);
    }
}
