using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Microsoft.Extensions.Options;
using Server.Options;

namespace Server.Services;

/// <summary>Envía los correos con la API HTTP de Mailpit, que los guarda en su buzón.</summary>
public class MailpitApiEmailSender(HttpClient http, IOptions<MailpitApiOptions> mailpit, IOptions<SmtpOptions> smtp) : IEmailSender
{
    private readonly MailpitApiOptions _mailpit = mailpit.Value;
    private readonly SmtpOptions _from = smtp.Value;

    public async Task SendAsync(
        string to,
        string? cc,
        string subject,
        string htmlBody,
        string textBody,
        IReadOnlyList<EmailAttachment> attachments,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            From = new { Email = _from.FromAddress, Name = _from.FromName },
            To = new[] { new { Email = to } },
            Cc = string.IsNullOrWhiteSpace(cc) ? [] : new[] { new { Email = cc } },
            Subject = subject,
            Text = textBody,
            HTML = htmlBody,
            Attachments = attachments.Select(a => new
            {
                Filename = a.FileName,
                ContentType = a.ContentType,
                Content = Convert.ToBase64String(a.Content)
            })
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{_mailpit.Url!.TrimEnd('/')}/api/v1/send")
        {
            Content = JsonContent.Create(payload)
        };
        if (!string.IsNullOrWhiteSpace(_mailpit.Username))
        {
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_mailpit.Username}:{_mailpit.Password}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        }

        using var response = await http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Mailpit respondió {(int)response.StatusCode}: {detail}");
        }
    }
}
