using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Ai.Commands.EnhanceCv;

namespace SmartHire.Application.Features.Ai.Common;

public static class CvEnhanceContextResolver {
    public static async Task<CvEnhanceRequest> ResolveAsync(
        EnhanceCvCommand request,
        ICvVersionRepository cvVersionRepository,
        IJobPostingRepository jobPostingRepository,
        CancellationToken cancellationToken) {
        string? cvContext = null;
        if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
            var cvVersion = await cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
            if (cvVersion != null) {
                cvContext = CvTextExtractor.ExtractText(cvVersion);
            }
        } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
            var cvVersion = await cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
            if (cvVersion != null) {
                cvContext = CvTextExtractor.ExtractText(cvVersion);
            }
        }

        string? jobContext = request.TargetJobDescription?.Trim();
        string? targetJobTitle = request.TargetJobTitle?.Trim();

        if (request.TargetJobId.HasValue && request.TargetJobId.Value != Guid.Empty) {
            var job = await jobPostingRepository.GetDetailByIdAsync(request.TargetJobId.Value, cancellationToken);
            if (job != null) {
                if (string.IsNullOrWhiteSpace(targetJobTitle)) {
                    targetJobTitle = job.Title;
                }
                var extractedJob = JobTextExtractor.ExtractText(job);
                jobContext = string.IsNullOrWhiteSpace(jobContext)
                    ? extractedJob
                    : $"{extractedJob}\n{jobContext}";
            }
        }

        return new CvEnhanceRequest(
            Content: request.Content?.Trim(),
            SectionType: request.SectionType?.Trim(),
            TargetJobTitle: targetJobTitle,
            CvContext: cvContext,
            JobContext: jobContext,
            Language: string.IsNullOrWhiteSpace(request.Language) ? "vi" : request.Language.Trim()
        );
    }
}

