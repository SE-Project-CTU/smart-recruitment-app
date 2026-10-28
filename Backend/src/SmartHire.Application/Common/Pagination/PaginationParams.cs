using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Common.Pagination;

/// <summary>
/// Tham số phân trang dùng chung cho các MediatR Query ở tầng Application
/// </summary>
public sealed record PaginationParams(
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20);
