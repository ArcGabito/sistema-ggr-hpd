using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Server.Services;

public static partial class Slug
{
    /// <summary>"Vidrio Low-E: eficiencia" → "vidrio-low-e-eficiencia".</summary>
    public static string From(string text)
    {
        var withoutAccents = new StringBuilder();
        foreach (var c in text.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                withoutAccents.Append(c);
            }
        }

        var slug = NonAlphanumeric().Replace(withoutAccents.ToString().ToLowerInvariant(), "-").Trim('-');
        return slug.Length > 200 ? slug[..200].TrimEnd('-') : slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();
}
