using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Server.Options;

namespace Server.Services;

public record EmailAttachment(string FileName, byte[] Content, string ContentType);

public interface IEmailSender
{
    Task SendAsync(
        string to,
        string? cc,
        string subject,
        string htmlBody,
        string textBody,
        IReadOnlyList<EmailAttachment> attachments,
        CancellationToken cancellationToken);
}

public class SmtpEmailSender(IOptions<SmtpOptions> options) : IEmailSender
{
    private readonly SmtpOptions _options = options.Value;

    public async Task SendAsync(
        string to,
        string? cc,
        string subject,
        string htmlBody,
        string textBody,
        IReadOnlyList<EmailAttachment> attachments,
        CancellationToken cancellationToken)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
        message.To.Add(MailboxAddress.Parse(to));
        if (!string.IsNullOrWhiteSpace(cc))
        {
            message.Cc.Add(MailboxAddress.Parse(cc));
        }
        message.Subject = subject;

        var body = new BodyBuilder { HtmlBody = htmlBody, TextBody = textBody };
        foreach (var attachment in attachments)
        {
            body.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
        }
        message.Body = body.ToMessageBody();

        var security = Enum.TryParse<SecureSocketOptions>(_options.Security, ignoreCase: true, out var parsed)
            ? parsed
            : SecureSocketOptions.Auto;

        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, security, cancellationToken);
        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            await client.AuthenticateAsync(_options.Username, _options.Password ?? string.Empty, cancellationToken);
        }
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
