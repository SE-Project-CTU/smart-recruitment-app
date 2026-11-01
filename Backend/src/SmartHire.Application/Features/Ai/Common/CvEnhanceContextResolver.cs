using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Ai.Commands.EnhanceCv;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Ai.Common;

public static class CvEnhanceContextResolver {
    public static async Task<CvEnhanceRequest> ResolveAsync(
        EnhanceCvCommand request,
        ICvVersionRepository cvVersionRepository,
        IJobPostingRepository jobPostingRepository,
        CancellationToken cancellationToken) {
        string? cvContext = null;
        CvLanguage? cvLanguage = null;

        if (request.CvVersionId.HasValue && request.CvVersionId.Value != Guid.Empty) {
            var cvVersion = await cvVersionRepository.GetByVersionIdAsync(request.CvVersionId.Value, cancellationToken);
            if (cvVersion != null) {
                cvContext = CvTextExtractor.ExtractText(cvVersion);
                cvLanguage = cvVersion.Language;
            }
        } else if (request.CvId.HasValue && request.CvId.Value != Guid.Empty) {
            var cvVersion = await cvVersionRepository.GetLatestByCvIdAsync(request.CvId.Value, cancellationToken);
            if (cvVersion != null) {
                cvContext = CvTextExtractor.ExtractText(cvVersion);
                cvLanguage = cvVersion.Language;
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

        // Phân giải ngôn ngữ mục tiêu:
        // Nếu client chỉ định rõ 'vi' hoặc 'en' -> Tuân theo client
        // Nếu client để trống hoặc 'auto' -> Tự động đồng bộ theo ngôn ngữ của CV đích (nếu có)
        // Fallback mặc định: 'auto'
        string resolvedLanguage;
        if (!string.IsNullOrWhiteSpace(request.Language) && !request.Language.Equals("auto", StringComparison.OrdinalIgnoreCase)) {
            resolvedLanguage = request.Language.Trim().ToLowerInvariant();
        } else if (cvLanguage.HasValue) {
            resolvedLanguage = cvLanguage.Value == CvLanguage.English ? "en" : "vi";
        } else {
            resolvedLanguage = "auto";
        }

        var normalizedSection = EnhanceCvCommandValidator.NormalizeSectionType(request.SectionType);

        return new CvEnhanceRequest(
            Content: request.Content?.Trim(),
            SectionType: normalizedSection,
            TargetJobTitle: targetJobTitle,
            CvContext: cvContext,
            JobContext: jobContext,
            Language: resolvedLanguage
        );
    }
}

