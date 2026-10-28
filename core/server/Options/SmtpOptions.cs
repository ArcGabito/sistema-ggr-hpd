using System.ComponentModel.DataAnnotations;

namespace Server.Options;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    [Required]
    public string Host { get; set; } = string.Empty;

    [Range(1, 65535)]
    public int Port { get; set; } = 587;

    /// <summary>None, StartTls, SslOnConnect o Auto.</summary>
    public string Security { get; set; } = "Auto";

    public string? Username { get; set; }
    public string? Password { get; set; }

    [Required, EmailAddress]
    public string FromAddress { get; set; } = string.Empty;

    public string FromName { get; set; } = "HPD Glass Group";
}
