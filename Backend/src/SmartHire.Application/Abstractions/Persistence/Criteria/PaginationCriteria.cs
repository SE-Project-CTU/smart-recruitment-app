namespace SmartHire.Application.Abstractions.Persistence.Criteria;

/// <summary>
/// Tiêu chí phân trang dùng chung cho tầng Persistence/Repository (Database-level pagination)
/// </summary>
public sealed record PaginationCriteria(int Skip, int PageSize);
