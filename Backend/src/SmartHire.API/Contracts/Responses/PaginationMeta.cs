namespace SmartHire.Api.Contracts.Responses;

public sealed record PaginationMeta(
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
);