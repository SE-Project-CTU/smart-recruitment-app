namespace SmartHire.Api.Contracts.Responses;

public sealed record ApiResponse<TData, TMeta>(
    TData Data,
    TMeta Meta,
    string CorrelationId
);