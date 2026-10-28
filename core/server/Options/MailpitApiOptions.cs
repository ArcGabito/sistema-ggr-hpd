namespace Server.Options;

/// <summary>
/// Envío por la API HTTP de Mailpit (POST /api/v1/send). Se usa cuando SMTP no está disponible,
/// como en Azure Container Apps sin red virtual, que solo expone HTTP. Si Url está vacía se usa SMTP.
/// </summary>
public class MailpitApiOptions
{
    public const string SectionName = "MailpitApi";

    public string? Url { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}
