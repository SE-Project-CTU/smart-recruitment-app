using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Responses;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Api.Factories;

public static class ApiResponseFactory {
    /// <summary>
    /// Wraps response data with empty metadata and a correlation ID.
    /// </summary>
    /// <typeparam name="TData">The response payload type.</typeparam>
    /// <param name="data">The response payload.</param>
    /// <param name="correlationId">The identifier associated with the request.</param>
    /// <returns>A success response containing the supplied data.</returns>
    public static ApiResponse<TData, EmptyMeta> Success<TData>(
        TData data,
        string correlationId
    ) => new(data, new EmptyMeta(), correlationId);
    
    /// <summary>
    /// Wraps a page of items with pagination metadata and a correlation ID.
    /// </summary>
    /// <typeparam name="TItem">The type of each item in the page.</typeparam>
    /// <param name="items">The items in the requested page.</param>
    /// <param name="page">The zero-based page index.</param>
    /// <param name="pageSize">The positive number of items allowed per page.</param>
    /// <param name="totalItems">The total item count across all pages.</param>
    /// <param name="correlationId">The identifier associated with the request.</param>
    /// <returns>A response with the items, page counts, and navigation flags.</returns>
    /// <exception cref="AppException">The page index is negative or the page size is less than one.</exception>
    public static ApiResponse<IReadOnlyList<TItem>, PaginationMeta> Paged<TItem>(
        IReadOnlyList<TItem> items,
        int page,
        int pageSize,
        int totalItems,
        string correlationId
    ) {
        if (page < 0) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageNumber,
                "Page must be greater than or equal to 0.");
        }
        
        if (pageSize < 1) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageSize,
                "Page size must be greater than 0.");
        }
        
        var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);
        
        var meta = new PaginationMeta(
            page,
            pageSize,
            totalItems,
            totalPages,
            HasNextPage: page < totalPages - 1,
            HasPreviousPage: page > 0
        );
        
        return new ApiResponse<IReadOnlyList<TItem>, PaginationMeta>(
            items,
            meta,
            correlationId
        );
    }
}