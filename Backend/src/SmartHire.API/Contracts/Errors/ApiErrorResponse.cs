using System.Text.Json.Serialization;
using SmartHire.Application.Common.Errors;

namespace SmartHire.Api.Contracts.Errors;

public sealed record ApiError(
    string Code,
    string Message,
    IReadOnlyList<AppErrorDetail> Details,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    object? Data = null
);

public sealed record ApiErrorResponse(
    ApiError Error,
    string CorrelationId
);