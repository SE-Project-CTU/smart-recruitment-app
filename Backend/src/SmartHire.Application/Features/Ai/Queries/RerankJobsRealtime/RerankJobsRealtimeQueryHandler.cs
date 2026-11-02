using MediatR;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.Criteria;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Queries.RerankJobsRealtime;

public sealed class RerankJobsRealtimeQueryHandler
    : IRequestHandler<RerankJobsRealtimeQuery, IReadOnlyList<RealtimeRecommendedJobDto>> {
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ICohereRerankService _cohereRerankService;

    public RerankJobsRealtimeQueryHandler(
        IJobPostingRepository jobPostingRepository,
        ICvVersionRepository cvVersionRepository,
        ICohereRerankService cohereRerankService) {
        _jobPostingRepository = jobPostingRepository;
        _cvVersionRepository = cvVersionRepository;
        _cohereRerankService = cohereRerankService;
    }

    public async Task<IReadOnlyList<RealtimeRecommendedJobDto>> Handle(
        RerankJobsRealtimeQuery request,
        CancellationToken cancellationToken) {
        // 1. Phân giải văn bản CV
        string cvText;
        if (!string.IsNullOrWhiteSpace(request.CvText)) {
            cvText = request.CvText.Trim();
        } else {
            CvVersion? cvVersion = null;
            if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
                cvVersion = await _cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
            } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
                cvVersion = await _cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
            }

            if (cvVersion == null) {
                throw AiExceptions.CvNotFound();
            }

            cvText = CvTextExtractor.ExtractText(cvVersion);
        }

        // 2. Lấy danh sách việc làm Published từ Database
        var limit = request.Limit is > 0 and <= 50 ? request.Limit.Value : 20;
        var criteria = new JobPostingSearchCriteria(
            new JobPostingSearchFilterCriteria(null, null, null, null, null, null, null, null, null, null, null),
            new JobPostingSearchSortCriteria(JobPostingSortField.CreatedAt, SortDirection.Desc),
            new PaginationCriteria(1, limit),
            DateTimeOffset.UtcNow
        );

        var (searchData, _) = await _jobPostingRepository.SearchPublicAsync(criteria, cancellationToken);
        if (searchData.Count == 0) {
            return Array.Empty<RealtimeRecommendedJobDto>();
        }

        // 3. Chuẩn bị danh sách Candidate Documents cho Cohere Rerank
        var detailedJobs = new List<(Guid JobId, SmartHire.Application.Abstractions.Persistence.ReadModels.JobPostingDetailData Detail, string FormattedText)>();
        foreach (var item in searchData) {
            var detail = await _jobPostingRepository.GetDetailByIdAsync(item.Id, cancellationToken);
            if (detail != null) {
                var jobText = JobTextExtractor.ExtractText(detail);
                detailedJobs.Add((item.Id, detail, jobText));
            }
        }

        if (detailedJobs.Count == 0) {
            return Array.Empty<RealtimeRecommendedJobDto>();
        }

        // 4. Gọi Cohere Rerank v3.5 trong DUY NHẤT 1 Request (Không tốn token Gemini)
        var rerankCandidates = detailedJobs
            .Select(j => new RerankCandidate(j.JobId, j.FormattedText))
            .ToList();

        var rerankedResults = await _cohereRerankService.RerankJobsAsync(
            cvText,
            rerankCandidates,
            cancellationToken);

        // 5. Trả về danh sách đã được sắp xếp theo đúng điểm số Cohere Rerank v3.5 giảm dần
        var resultList = new List<RealtimeRecommendedJobDto>();
        foreach (var rerankItem in rerankedResults) {
            var match = detailedJobs.FirstOrDefault(j => j.JobId == rerankItem.Id);
            if (match.Detail != null) {
                var d = match.Detail;
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
                    Score: rerankItem.Score
                ));
            }
        }

        return resultList;
    }
}

