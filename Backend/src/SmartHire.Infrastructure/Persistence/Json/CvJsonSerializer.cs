using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Json;

public static class CvJsonSerializer
{
    public static JsonSerializerOptions Options { get; } = CreateOptions();

    public static string Serialize<T>(T value) =>
        JsonSerializer.Serialize(value, Options);

    public static T Deserialize<T>(string json) =>
        JsonSerializer.Deserialize<T>(json, Options)
        ?? throw new JsonException($"Could not deserialize JSON as {typeof(T).Name}.");

    private static JsonSerializerOptions CreateOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new CvLanguageJsonConverter());
        return options;
    }
}

public sealed class CvLanguageJsonConverter : JsonConverter<CvLanguage>
{
    public override CvLanguage Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return CvLanguageCodes.FromCode(reader.GetString());
    }

    public override void Write(Utf8JsonWriter writer, CvLanguage value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(CvLanguageCodes.ToCode(value));
    }
}

public static class CvLanguageCodes
{
    public static string ToCode(CvLanguage language) => language switch
    {
        CvLanguage.Vietnamese => "vi",
        CvLanguage.English => "en",
        _ => throw new JsonException($"Unsupported CV language value '{language}'.")
    };

    public static CvLanguage FromCode(string? code) => code switch
    {
        "vi" => CvLanguage.Vietnamese,
        "en" => CvLanguage.English,
        _ => throw new JsonException($"Unsupported CV language code '{code}'.")
    };
}
