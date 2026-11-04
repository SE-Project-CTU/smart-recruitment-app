using SmartHire.Application.Common.Validation;

namespace SmartHire.Api.Contracts.Requests;

/// <summary>
/// Tham số phân trang dùng chung cho các API Request
/// </summary>
public sealed class PaginationRequest
{
    public int Page { get; init; } = PagedListQueryValidator.FirstPage;
    public int PageSize { get; init; } = 20;
}
