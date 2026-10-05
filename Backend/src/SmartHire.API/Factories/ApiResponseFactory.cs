using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Responses;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Api.Factories;

public static class ApiResponseFactory {
    public static ApiResponse<TData, EmptyMeta> Success<TData>(
        TData data,
        string correlationId
    ) => new(data, new EmptyMeta(), correlationId);
    
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