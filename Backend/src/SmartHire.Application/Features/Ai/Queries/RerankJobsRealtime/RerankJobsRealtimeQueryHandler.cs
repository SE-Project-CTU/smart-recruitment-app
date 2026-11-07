using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.Criteria;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Matching;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Queries.RerankJobsRealtime;

public sealed class RerankJobsRealtimeQueryHandler
    : IRequestHandler<RerankJobsRealtimeQuery, IReadOnlyList<RealtimeRecommendedJobDto>> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ISmartHireMatchEngine _matchEngine;

    public RerankJobsRealtimeQueryHandler(
        IJobPostingRepository jobPostingRepository,
        ICvVersionRepository cvVersionRepository,
        ISmartHireMatchEngine matchEngine) {
        _jobPostingRepository = jobPostingRepository;
        _cvVersionRepository = cvVersionRepository;
        _matchEngine = matchEngine;
    }

    public async Task<IReadOnlyList<RealtimeRecommendedJobDto>> Handle(
        RerankJobsRealtimeQuery request,
        CancellationToken cancellationToken) {
        // Phân giải văn bản và đối tượng CV
        CvVersion? cvVersion = null;
        string? cvText = request.CvText?.Trim();

        if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
            cvVersion = await _cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
        } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
            cvVersion = await _cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
        }

        if (cvVersion == null && string.IsNullOrWhiteSpace(cvText)) {
            throw AiExceptions.CvNotFound();
        }

        // Lấy danh sách việc làm Published từ Database (Hỗ trợ phân trang và danh mục phong phú đến 500 jobs)
        var limit = request.Limit is > 0 and <= 500 ? request.Limit.Value : 100;
        var criteria = new JobPostingSearchCriteria(
            new JobPostingSearchFilterCriteria(null, null, null, null, null, null, null, null, null, null, null, [], [], false),
            new JobPostingSearchSortCriteria(JobPostingSortField.CreatedAt, SortDirection.Desc),
            new PaginationCriteria(1, limit),
            DateTimeOffset.UtcNow
        );

        var (searchData, _) = await _jobPostingRepository.SearchPublicAsync(criteria, cancellationToken);
        if (searchData.Count == 0) {
            return Array.Empty<RealtimeRecommendedJobDto>();
        }

        // Nạp toàn bộ chi tiết Job trong DUY NHẤT 1 Query (Triệt tiêu N+1 Query)
        var detailedJobs = await _jobPostingRepository.GetDetailsByIdsAsync(
            searchData.Select(s => s.Id),
            cancellationToken);

        if (detailedJobs.Count == 0) {
            return Array.Empty<RealtimeRecommendedJobDto>();
        }

        // Đánh giá và Xếp hạng bằng SmartHire In-House Match Engine (Thuần In-Memory, < 10ms)
        var rankedResults = cvVersion != null
            ? _matchEngine.EvaluateBatch(cvVersion.Content, detailedJobs)
            : _matchEngine.EvaluateBatchFromText(cvText!, detailedJobs);

        // Trả về danh sách đã được sắp xếp theo đúng điểm số giảm dần
        var detailedJobsMap = detailedJobs.ToDictionary(j => j.Id);
        var resultList = new List<RealtimeRecommendedJobDto>();

        foreach (var match in rankedResults) {
            if (detailedJobsMap.TryGetValue(match.JobId, out var d)) {
                var loc = !string.IsNullOrWhiteSpace(d.Location?.ProvinceName) ? d.Location.ProvinceName : "Toàn quốc";
                var salaryText = (d.SalaryMin.HasValue && d.SalaryMax.HasValue)
                    ? $"{d.SalaryMin.Value / 1_000_000:0} – {d.SalaryMax.Value / 1_000_000:0} triệu VNĐ"
                    : (d.SalaryNegotiable ? "Thỏa thuận" : "Cạnh tranh");

                resultList.Add(new RealtimeRecommendedJobDto(
                    Id: d.Id,
                    Title: d.Title,
                    CompanyName: d.Company?.Name ?? "Doanh nghiệp tuyển dụng",
                    LogoUrl: d.Company?.LogoUrl,
                    Location: loc,
                    SalaryMin: d.SalaryMin,
                    SalaryMax: d.SalaryMax,
                    SalaryText: salaryText,
                    Requirements: d.Requirements ?? string.Empty,
                    Score: match.Score
                ));
            }
        }

        return resultList;
    }
}
