namespace SmartHire.Infrastructure.Ai;

public sealed class CohereOptions {
    public const string SectionName = "Cohere";

    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "rerank-v3.5";
    public int TimeoutSeconds { get; set; } = 20;
}
