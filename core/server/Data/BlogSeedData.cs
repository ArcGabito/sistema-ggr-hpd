using Server.Models;
using Server.Services;

namespace Server.Data;

/// <summary>Artículos publicados en hpdglass.com; el blog enlaza a la publicación original.</summary>
public static class BlogSeedData
{
    private const string Site = "https://www.hpdglass.com";

    private static BlogPost Post(string title, string date, string category, string summary, string path, string art) => new()
    {
        Title = title,
        Slug = Slug.From(title),
        Summary = summary,
        Category = category,
        CoverArt = art,
        ExternalUrl = $"{Site}/{path}/",
        IsPublished = true,
        PublishedAt = DateTime.SpecifyKind(DateTime.Parse(date), DateTimeKind.Utc).AddHours(17),
        CreatedAt = DateTime.SpecifyKind(DateTime.Parse(date), DateTimeKind.Utc).AddHours(17)
    };

    public static IReadOnlyList<BlogPost> Posts =>
    [
        Post("HPD Glassgroup impulsa la innovación con vidrio laminado", "2025-05-19", "Arquitectura",
            "Cómo el vidrio laminado forma parte de nuestra apuesta por desarrollar nuevos productos.",
            "hpd-glassgroup-impulsa-la-innovacion-con-vidrio-laminado", "insulated"),
        Post("Vidrio laminado en arquitectura: seguridad y confort en el diseño moderno", "2025-05-19", "Arquitectura",
            "Por qué el vidrio laminado aporta seguridad y confort a los edificios contemporáneos.",
            "vidrio-laminado-en-arquitectura-seguridad-y-confort-en-el-diseno-moderno", "window"),
        Post("Vidrio templado en arquitectura: resistencia y seguridad en el diseño moderno", "2025-05-19", "Arquitectura",
            "La resistencia del vidrio templado y su lugar en los proyectos arquitectónicos actuales.",
            "vidrio-templado-en-arquitectura-resistencia-y-seguridad-en-el-diseno-moderno", "curtain"),
        Post("Vidrio Low-E: eficiencia energética y confort térmico en la construcción", "2025-02-20", "Arquitectura",
            "Cómo el vidrio de baja emisividad ayuda a ahorrar energía y mantener el confort térmico.",
            "vidrio-y-sostenibilidad-un-futuro-mas-verde", "tower"),
        Post("La innovación del vidrio: tendencias y aplicaciones en arquitectura", "2025-02-19", "Arquitectura",
            "Un recorrido por las tendencias actuales del vidrio y sus usos en arquitectura.",
            "la-importancia-del-vidrio-en-la-arquitectura-de-hoy", "panels"),
        Post("Vidrio insulado: mayor aislamiento térmico y acústico para edificaciones sostenibles", "2025-02-18", "Diseño",
            "El papel del vidrio insulado en el aislamiento térmico y acústico de edificios sostenibles.",
            "la-innovacion-del-vidrio-tendencias-y-aplicaciones", "sliding")
    ];
}
