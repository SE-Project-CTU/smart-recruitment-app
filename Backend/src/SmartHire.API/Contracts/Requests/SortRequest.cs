namespace SmartHire.Api.Contracts.Requests;

/// <summary>
/// Tham số sắp xếp dùng chung cho các API Request
/// </summary>
public class SortRequest
{
    public string? Sort { get; init; }
    public string? Direction { get; init; }
}
