using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching.Evaluators;

public static class LocationEducationEvaluator {
    public static decimal Evaluate(CvContentDocument? cv, JobPostingDetailData job) {
        // Đánh giá Địa điểm (Trọng số 60% của nhóm Tiêu chuẩn phụ)
        decimal locationScore = EvaluateLocation(cv, job);

        // Đánh giá Học vấn (Trọng số 40% của nhóm Tiêu chuẩn phụ)
        decimal educationScore = EvaluateEducation(cv, job);

        decimal score = (locationScore * 0.60m) + (educationScore * 0.40m);
        return Math.Round(Math.Clamp(score, 10m, 100m), 2);
    }

    private static decimal EvaluateLocation(CvContentDocument? cv, JobPostingDetailData job) {
        var workMode = job.WorkMode;

        // Nếu Job là Remote hoặc Toàn quốc: Không có rào cản địa lý
        if (workMode == WorkMode.Remote) {
            return 100m;
        }

        var candidateAddress = cv != null ? CvTiptapDocument.ExtractPlainText(cv.Profile.Address) : string.Empty;
        var jobProvince = job.Location?.ProvinceName ?? string.Empty;

        if (string.IsNullOrWhiteSpace(jobProvince) || jobProvince.Equals("Toàn quốc", StringComparison.OrdinalIgnoreCase)) {
            return 100m;
        }

        bool isSameProvince = !string.IsNullOrWhiteSpace(candidateAddress) &&
                              candidateAddress.Contains(jobProvince, StringComparison.OrdinalIgnoreCase);

        if (isSameProvince) {
            return 100m;
        }

        // Nếu khác tỉnh:
        return workMode switch {
            WorkMode.Hybrid => 60m, // Có thể di chuyển bán thời gian
            WorkMode.Onsite => 20m, // Rào cản địa lý vật lý bắt buộc
            _ => 70m
        };
    }

    private static decimal EvaluateEducation(CvContentDocument? cv, JobPostingDetailData job) {
        if (!job.EducationLevel.HasValue || job.EducationLevel == EducationLevel.NoRequirement) {
            return 100m;
        }

        if (cv?.Sections.Education?.Items == null || cv.Sections.Education.Items.Count == 0) {
            return 75m; // Không ghi nhận rõ trên CV
        }

        var allEduText = string.Join(" ", cv.Sections.Education.Items.Select(e =>
            $"{CvTiptapDocument.ExtractPlainText(e.Title)} {CvTiptapDocument.ExtractPlainText(e.School)} {CvTiptapDocument.ExtractPlainText(e.Details)}"))
            .ToLowerInvariant();

        return job.EducationLevel switch {
            EducationLevel.Postgraduate => allEduText.Contains("thạc sĩ") || allEduText.Contains("master") || allEduText.Contains("tiến sĩ") || allEduText.Contains("phd") ? 100m : 70m,
            EducationLevel.Bachelor => allEduText.Contains("đại học") || allEduText.Contains("cử nhân") || allEduText.Contains("kỹ sư") || allEduText.Contains("bachelor") || allEduText.Contains("university") ? 100m : 80m,
            EducationLevel.College => allEduText.Contains("cao đẳng") || allEduText.Contains("college") ? 100m : 85m,
            _ => 100m
        };
    }
}

