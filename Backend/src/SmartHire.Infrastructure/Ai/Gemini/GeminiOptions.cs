namespace SmartHire.Infrastructure.Ai;

public sealed class GeminiOptions {
    public const string SectionName = "Gemini";

    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gemini-3.5-flash-lite";
    public string EmbeddingModel { get; set; } = "gemini-embedding-001";
    public int TimeoutSeconds { get; set; } = 60;
}
