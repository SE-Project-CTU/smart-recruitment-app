namespace SmartHire.Api.Contracts.Requests;

/// <summary>
/// Bộ lọc danh sách hồ sơ ứng tuyển theo công ty
/// </summary>
public sealed class CompanyApplicationFilterRequest
{
    public Guid? JobId { get; init; }
    public string? Status { get; init; }
    public string? Search { get; init; }
}
