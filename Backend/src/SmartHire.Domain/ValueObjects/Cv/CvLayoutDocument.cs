namespace SmartHire.Domain.ValueObjects.Cv;

public sealed record CvLayoutDocument
{
    public string Version { get; init; } = "1.0";
    public List<CvLayoutArea> Areas { get; init; } = [];
}

public sealed record CvLayoutArea
{
    public string Id { get; init; } = string.Empty;
    public HashSet<string> Sections { get; init; } = [];
}
