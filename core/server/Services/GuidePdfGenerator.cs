using System.Globalization;
using System.Text;
using Server.Models;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.Core;
using UglyToad.PdfPig.Writer;

namespace Server.Services;

public interface IGuidePdfGenerator
{
    byte[] Generate(RemissionGuide guide);
}

/// <summary>
/// Genera la guía de remisión en PDF (A4) con Liberation Sans incrustada (Assets/Fonts), que cubre
/// todos los caracteres del español. Espera la guía con Client, OriginSite, Items.Product y
/// Dispatch (Vehicle, Driver) cargados.
/// </summary>
public class GuidePdfGenerator : IGuidePdfGenerator
{
    private const string LegalName = "HPD Contratistas Generales S.A.C.";
    private const string Ruc = "20418528011";
    private const string Contact = "(51-1) 611-0000 · ventas@hpdglass.com · www.hpdglass.com";

    private const double PageWidth = 595;
    private const double PageHeight = 842;
    private const double Margin = 40;
    private const double ContentWidth = PageWidth - 2 * Margin;

    private static readonly TimeSpan LimaOffset = TimeSpan.FromHours(-5);
    private static readonly CultureInfo Peru = CultureInfo.GetCultureInfo("es-PE");

    private static readonly string FontDirectory = Path.Combine(AppContext.BaseDirectory, "Assets", "Fonts");
    private static readonly Lazy<byte[]> RegularFont = new(() => File.ReadAllBytes(Path.Combine(FontDirectory, "LiberationSans-Regular.ttf")));
    private static readonly Lazy<byte[]> BoldFont = new(() => File.ReadAllBytes(Path.Combine(FontDirectory, "LiberationSans-Bold.ttf")));

    private static readonly Dictionary<TransferReason, string> Reasons = new()
    {
        [TransferReason.Sale] = "Venta",
        [TransferReason.TransferBetweenSites] = "Traslado entre establecimientos",
        [TransferReason.Return] = "Devolución",
        [TransferReason.Other] = "Otros"
    };

    private static readonly Dictionary<RemissionGuideStatus, string> Statuses = new()
    {
        [RemissionGuideStatus.Draft] = "BORRADOR",
        [RemissionGuideStatus.Issued] = "EMITIDA",
        [RemissionGuideStatus.InTransit] = "EN TRÁNSITO",
        [RemissionGuideStatus.Delivered] = "ENTREGADA",
        [RemissionGuideStatus.Cancelled] = "ANULADA"
    };

    public byte[] Generate(RemissionGuide guide)
    {
        var builder = new PdfDocumentBuilder();
        var regular = builder.AddTrueTypeFont(RegularFont.Value);
        var bold = builder.AddTrueTypeFont(BoldFont.Value);
        var writer = new Writer(builder, regular, bold).Init();

        DrawHeader(writer, guide);
        DrawFacts(writer, guide);
        DrawParties(writer, guide);
        DrawItems(writer, guide);
        DrawNotes(writer, guide);
        writer.DrawFooters(guide.FullNumber);

        return builder.Build();
    }

    private static void DrawHeader(Writer w, RemissionGuide guide)
    {
        var page = w.Page;
        var top = PageHeight - Margin;

        // Franja de marca.
        page.SetTextAndFillColor(134, 169, 204);
        page.SetStrokeColor(134, 169, 204);
        page.DrawRectangle(new PdfPoint(0, PageHeight - 8), PageWidth, 8, 0, fill: true);
        page.ResetColor();

        w.Text(LegalName, Margin, top - 18, 14, bold: true);
        w.Text($"RUC {Ruc}", Margin, top - 34, 9);
        var site = guide.OriginSite!;
        w.Text($"{site.Address}, {site.District}, {site.Province}", Margin, top - 47, 9);
        w.Text(Contact, Margin, top - 60, 9);

        // Recuadro del documento.
        const double boxWidth = 200;
        var boxX = PageWidth - Margin - boxWidth;
        page.DrawRectangle(new PdfPoint(boxX, top - 72), boxWidth, 72, 1.2, fill: false);
        w.Centered($"RUC {Ruc}", boxX, boxWidth, top - 18, 10, bold: true);
        w.Centered("GUÍA DE REMISIÓN REMITENTE", boxX, boxWidth, top - 36, 10, bold: true);
        w.Centered(guide.FullNumber, boxX, boxWidth, top - 58, 15, bold: true);

        w.Cursor = top - 92;
        if (guide.Status is RemissionGuideStatus.Draft or RemissionGuideStatus.Cancelled)
        {
            page.SetTextAndFillColor(200, 40, 40);
            w.Text($"DOCUMENTO {Statuses[guide.Status]} — SIN VALIDEZ PARA EL TRASLADO", Margin, w.Cursor, 10, bold: true);
            page.ResetColor();
            w.Cursor -= 18;
        }
    }

    private static void DrawFacts(Writer w, RemissionGuide guide)
    {
        var facts = new (string Label, string Value)[]
        {
            ("Fecha de emisión", FormatDate(guide.IssueDate)),
            ("Inicio de traslado", FormatDate(guide.TransferDate)),
            ("Motivo de traslado", Reasons[guide.TransferReason]),
            ("Peso bruto total", $"{guide.TotalWeightKg.ToString("N2", Peru)} kg")
        };

        const double height = 40;
        var y = w.Cursor - height;
        w.Page.SetTextAndFillColor(242, 246, 250);
        w.Page.SetStrokeColor(242, 246, 250);
        w.Page.DrawRectangle(new PdfPoint(Margin, y), ContentWidth, height, 0, fill: true);
        w.Page.ResetColor();

        var columnWidth = ContentWidth / facts.Length;
        for (var i = 0; i < facts.Length; i++)
        {
            var x = Margin + 10 + i * columnWidth;
            w.Label(facts[i].Label, x, y + height - 14);
            w.Text(facts[i].Value, x, y + 10, 10, bold: true);
        }
        w.Cursor = y - 22;
    }

    private static void DrawParties(Writer w, RemissionGuide guide)
    {
        var client = guide.Client!;
        var site = guide.OriginSite!;
        var columnWidth = ContentWidth / 2 - 10;
        var left = Margin;
        var right = Margin + ContentWidth / 2 + 10;
        var top = w.Cursor;

        w.Label("DESTINATARIO", left, top);
        var y = w.Paragraph(client.LegalName ?? client.DisplayName, left, top - 15, columnWidth, 10, bold: true);
        y = w.Paragraph(client.TaxId is null ? "Sin RUC registrado" : $"RUC {client.TaxId}", left, y, columnWidth, 9);
        var contact = string.Join(' ', new[] { client.FirstName, client.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
        if (contact.Length > 0)
        {
            y = w.Paragraph($"Contacto: {contact}", left, y, columnWidth, 9);
        }
        var leftBottom = y;

        w.Label("PUNTO DE PARTIDA", right, top);
        y = w.Paragraph($"{site.Address}, {site.District}, {site.Province}", right, top - 15, columnWidth, 9);
        w.Label("PUNTO DE LLEGADA", right, y - 6);
        y = w.Paragraph(guide.DeliveryAddress, right, y - 21, columnWidth, 9);
        var rightBottom = y;

        y = Math.Min(leftBottom, rightBottom) - 8;
        w.Label("TRANSPORTE", left, y);
        var transport = guide.Dispatch is { } dispatch
            ? $"Despacho {dispatch.Code} · Vehículo {dispatch.Vehicle?.Plate} · Conductor {dispatch.Driver?.FullName} (DNI {dispatch.Driver?.DocumentNumber}, licencia {dispatch.Driver?.LicenseNumber})"
            : "Pendiente de asignación a un despacho.";
        y = w.Paragraph(transport, left, y - 15, ContentWidth, 9);
        w.Cursor = y - 14;
    }

    private static void DrawItems(Writer w, RemissionGuide guide)
    {
        // Columnas: #, código, descripción, cantidad, U.M., peso.
        double[] widths = [24, 70, 241, 65, 45, 70];
        string[] headers = ["#", "Código", "Descripción", "Cantidad", "U.M.", "Peso (kg)"];
        bool[] rightAligned = [false, false, false, true, false, true];

        void DrawTableHeader()
        {
            const double height = 20;
            var y = w.Cursor - height;
            w.Page.SetTextAndFillColor(38, 40, 43);
            w.Page.SetStrokeColor(38, 40, 43);
            w.Page.DrawRectangle(new PdfPoint(Margin, y), ContentWidth, height, 0, fill: true);
            w.Page.SetTextAndFillColor(255, 255, 255);
            var x = Margin;
            for (var i = 0; i < widths.Length; i++)
            {
                if (rightAligned[i]) w.RightAligned(headers[i], x + widths[i] - 6, y + 7, 8, bold: true);
                else w.Text(headers[i], x + 6, y + 7, 8, bold: true);
                x += widths[i];
            }
            w.Page.ResetColor();
            w.Cursor = y;
        }

        DrawTableHeader();
        var index = 0;
        foreach (var item in guide.Items.OrderBy(i => i.Id))
        {
            index++;
            var lines = w.Wrap(item.Description, widths[2] - 12, 9, bold: false);
            var rowHeight = Math.Max(20, lines.Count * 11 + 9);
            if (w.Cursor - rowHeight < Margin + 40)
            {
                w.NewPage();
                DrawTableHeader();
            }

            var top = w.Cursor;
            var baseline = top - 13;
            var x = Margin;
            string[] cells =
            [
                index.ToString(Peru),
                item.Product?.Code ?? string.Empty,
                string.Empty,
                item.Quantity.ToString("N3", Peru),
                item.UnitOfMeasure,
                item.WeightKg.ToString("N2", Peru)
            ];
            for (var i = 0; i < widths.Length; i++)
            {
                if (i == 2)
                {
                    for (var l = 0; l < lines.Count; l++) w.Text(lines[l], x + 6, baseline - l * 11, 9);
                }
                else if (rightAligned[i]) w.RightAligned(cells[i], x + widths[i] - 6, baseline, 9);
                else w.Text(cells[i], x + 6, baseline, 9);
                x += widths[i];
            }

            w.Cursor = top - rowHeight;
            w.Page.SetStrokeColor(210, 212, 216);
            w.Page.DrawLine(new PdfPoint(Margin, w.Cursor), new PdfPoint(Margin + ContentWidth, w.Cursor), 0.5);
            w.Page.ResetColor();
        }

        w.Cursor -= 16;
        w.RightAligned($"Peso bruto total: {guide.TotalWeightKg.ToString("N2", Peru)} kg", Margin + ContentWidth, w.Cursor, 10, bold: true);
        w.Cursor -= 24;
    }

    private static void DrawNotes(Writer w, RemissionGuide guide)
    {
        if (string.IsNullOrWhiteSpace(guide.Notes)) return;
        if (w.Cursor < Margin + 80) w.NewPage();
        w.Label("OBSERVACIONES", Margin, w.Cursor);
        w.Cursor = w.Paragraph(guide.Notes, Margin, w.Cursor - 15, ContentWidth, 9);
    }

    private static string FormatDate(DateTime utc) => (utc + LimaOffset).ToString("dd/MM/yyyy", Peru);

    /// <summary>Página actual, cursor vertical y utilidades de texto.</summary>
    private sealed class Writer(PdfDocumentBuilder builder, PdfDocumentBuilder.AddedFont regularFont, PdfDocumentBuilder.AddedFont boldFont)
    {
        private readonly List<PdfPageBuilder> _pages = [];

        public PdfPageBuilder Page { get; private set; } = null!;
        public double Cursor { get; set; }

        public Writer Init()
        {
            NewPage();
            return this;
        }

        public void NewPage()
        {
            Page = builder.AddPage(PageWidth, PageHeight);
            _pages.Add(Page);
            Cursor = PageHeight - Margin;
        }

        public void Text(string text, double x, double y, double size, bool bold = false)
        {
            var font = bold ? boldFont : regularFont;
            try
            {
                Page.AddText(Printable(text), size, new PdfPoint(x, y), font);
            }
            catch (Exception)
            {
                // Un carácter que la fuente no tiene (p. ej. un emoji) no debe impedir generar la guía.
                Page.AddText(Latin(text), size, new PdfPoint(x, y), font);
            }
        }

        public void Label(string text, double x, double y)
        {
            Page.SetTextAndFillColor(124, 129, 138);
            Text(text.ToUpperInvariant(), x, y, 7.5, bold: true);
            Page.ResetColor();
        }

        public void RightAligned(string text, double right, double y, double size, bool bold = false) =>
            Text(text, right - Width(text, size, bold), y, size, bold);

        public void Centered(string text, double x, double width, double y, double size, bool bold = false) =>
            Text(text, x + (width - Width(text, size, bold)) / 2, y, size, bold);

        /// <summary>Escribe un párrafo con ajuste de línea y devuelve la línea base siguiente.</summary>
        public double Paragraph(string text, double x, double y, double width, double size, bool bold = false)
        {
            foreach (var line in Wrap(text, width, size, bold))
            {
                Text(line, x, y, size, bold);
                y -= size + 3;
            }
            return y;
        }

        public List<string> Wrap(string text, double width, double size, bool bold)
        {
            var lines = new List<string>();
            var current = string.Empty;
            foreach (var word in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                var candidate = current.Length == 0 ? word : $"{current} {word}";
                if (current.Length > 0 && Width(candidate, size, bold) > width)
                {
                    lines.Add(current);
                    current = word;
                }
                else
                {
                    current = candidate;
                }
            }
            if (current.Length > 0) lines.Add(current);
            return lines.Count == 0 ? [string.Empty] : lines;
        }

        public double Width(string text, double size, bool bold)
        {
            var printable = Printable(text);
            if (printable.Length == 0) return 0;
            IReadOnlyList<UglyToad.PdfPig.Content.Letter> letters;
            try
            {
                letters = Page.MeasureText(printable, size, new PdfPoint(0, 0), bold ? boldFont : regularFont);
            }
            catch (Exception)
            {
                letters = Page.MeasureText(Latin(printable), size, new PdfPoint(0, 0), bold ? boldFont : regularFont);
            }
            return letters.Count == 0 ? 0 : letters[^1].EndBaseLine.X;
        }

        public void DrawFooters(string number)
        {
            var generated = (DateTime.UtcNow + LimaOffset).ToString("dd/MM/yyyy HH:mm", Peru);
            for (var i = 0; i < _pages.Count; i++)
            {
                Page = _pages[i];
                Page.SetTextAndFillColor(124, 129, 138);
                Text($"{number} · Generado por Sistema GGR · HPD Glass Group · {generated}", Margin, 24, 7.5);
                RightAligned($"Página {i + 1} de {_pages.Count}", PageWidth - Margin, 24, 7.5);
                Page.ResetColor();
            }
        }

        /// <summary>Texto en forma normalizada y sin caracteres de control.</summary>
        private static string Printable(string text) =>
            new(text.Normalize(NormalizationForm.FormC).Select(c => char.IsControl(c) ? ' ' : c).ToArray());

        /// <summary>Respaldo: conserva Latin-1 y la puntuación habitual; el resto se sustituye por "?".</summary>
        private static string Latin(string text) =>
            new(Printable(text).Select(c => c is >= ' ' and <= '\u00FF' || "–—‘’“”•…€".Contains(c) ? c : '?').ToArray());
    }
}
