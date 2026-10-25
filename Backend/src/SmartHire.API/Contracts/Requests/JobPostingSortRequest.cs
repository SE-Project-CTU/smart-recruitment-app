namespace SmartHire.Api.Contracts.Requests;

public sealed class JobPostingSortRequest
{
    public string? Sort { get; init; }
    public string? Direction { get; init; }
}
