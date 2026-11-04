namespace SmartHire.Api.Contracts.Requests;

public sealed class SearchJobPostingsRequest
{
    public JobPostingFilterRequest Filter { get; init; } = new();
    public JobPostingSortRequest Sort { get; init; } = new();
    public PaginationRequest Pagination { get; init; } = new();
}
