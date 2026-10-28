using System.Globalization;
using System.Net;
using Server.Models;

namespace Server.Services;

/// <summary>Asunto y cuerpo (HTML y texto) del correo con la guía de remisión.</summary>
public static class GuideEmailComposer
{
    private static readonly CultureInfo Peru = CultureInfo.GetCultureInfo("es-PE");
    private static readonly TimeSpan LimaOffset = TimeSpan.FromHours(-5);

    public static string Subject(RemissionGuide guide) => $"Guía de remisión {guide.FullNumber} - HPD Glass Group";

    public static (string Html, string Text) Body(RemissionGuide guide, string? message, bool hasInvoice)
    {
        var client = guide.Client!.LegalName ?? guide.Client.DisplayName;
        var transferDate = (guide.TransferDate + LimaOffset).ToString("dd/MM/yyyy", Peru);
        var weight = guide.TotalWeightKg.ToString("N2", Peru);
        var attachments = hasInvoice ? "la guía de remisión y la factura correspondiente" : "la guía de remisión";
        var note = string.IsNullOrWhiteSpace(message) ? null : message.Trim();

        string E(string value) => WebUtility.HtmlEncode(value);
        string Row(string label, string value) =>
            $"<tr><td style=\"padding:6px 12px 6px 0;color:#7c818a;font-size:13px\">{E(label)}</td><td style=\"padding:6px 0;font-size:13px;color:#1b1c1e\"><strong>{E(value)}</strong></td></tr>";

        var html = $"""
            <!doctype html>
            <html lang="es">
            <body style="margin:0;background:#f2f6fa;font-family:Arial,Helvetica,sans-serif;color:#1b1c1e">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0">
                <tr><td align="center">
                  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden">
                    <tr><td style="background:#86a9cc;height:8px"></td></tr>
                    <tr><td style="padding:32px">
                      <p style="margin:0;font-size:12px;letter-spacing:2px;color:#527aa3;font-weight:bold">HPD GLASS GROUP</p>
                      <h1 style="margin:8px 0 16px;font-size:22px">Guía de remisión {E(guide.FullNumber)}</h1>
                      <p style="margin:0 0 16px;font-size:14px;line-height:1.6">Estimado cliente <strong>{E(client)}</strong>:</p>
                      <p style="margin:0 0 16px;font-size:14px;line-height:1.6">Le enviamos adjunta {E(attachments)} del traslado de su pedido.</p>
                      {(note is null ? "" : $"<p style=\"margin:0 0 16px;padding:12px 16px;background:#f2f6fa;border-radius:12px;font-size:14px;line-height:1.6\">{E(note).Replace("\n", "<br>")}</p>")}
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px">
                        {Row("Inicio de traslado", transferDate)}
                        {Row("Punto de llegada", guide.DeliveryAddress)}
                        {Row("Peso bruto total", $"{weight} kg")}
                      </table>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#5e626a">Ante cualquier consulta, responda este correo o comuníquese al (51-1) 611-0000.</p>
                    </td></tr>
                    <tr><td style="padding:16px 32px;background:#26282b;color:#a9adb4;font-size:11px">
                      HPD Contratistas Generales S.A.C. · RUC 20418528011 · www.hpdglass.com
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        var text = $"""
            Guía de remisión {guide.FullNumber} - HPD Glass Group

            Estimado cliente {client}:

            Le enviamos adjunta {attachments} del traslado de su pedido.
            {(note is null ? "" : $"\n{note}\n")}
            Inicio de traslado: {transferDate}
            Punto de llegada: {guide.DeliveryAddress}
            Peso bruto total: {weight} kg

            Ante cualquier consulta, responda este correo o comuníquese al (51-1) 611-0000.
            HPD Contratistas Generales S.A.C. · RUC 20418528011
            """;

        return (html, text);
    }
}
