using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching.Evaluators;

public static class ExperienceEvaluator {
    public static (decimal Score, decimal ActualYears, int? RequiredYears, bool HasBonus, decimal BonusPoints) Evaluate(
        CvContentDocument? cv,
        JobPostingDetailData job) {
        decimal actualYears = CalculateExperienceYears(cv);
        int? requiredYears = job.ExperienceYears;

        decimal baseScore;
        if (!requiredYears.HasValue || requiredYears.Value <= 0) {
            // Job không yêu cầu số năm kinh nghiệm cụ thể
            baseScore = actualYears > 0 ? 100m : 85m;
        } else {
            decimal req = requiredYears.Value;
            if (actualYears >= req) {
                baseScore = 100m;
            } else {
                decimal ratio = actualYears / req;
                baseScore = Math.Round(Math.Max(25m, ratio * 100m), 2);
            }
        }

        // Kiểm tra Điểm thưởng Ngành nghề (+5% Bonus)
        bool hasIndustryBonus = CheckIndustryBonus(cv, job);
        decimal bonusPoints = hasIndustryBonus ? 5.0m : 0.0m;

        decimal finalScore = Math.Clamp(baseScore + bonusPoints, 0m, 100m);

        return (finalScore, actualYears, requiredYears, hasIndustryBonus, bonusPoints);
    }

    public static decimal CalculateExperienceYears(CvContentDocument? cv) {
        if (cv?.Sections.Experience?.Items == null || cv.Sections.Experience.Items.Count == 0) {
            return 0m;
        }

        int totalMonths = 0;
        foreach (var item in cv.Sections.Experience.Items) {
            var startStr = CvTiptapDocument.ExtractPlainText(item.StartDate);
            var endStr = CvTiptapDocument.ExtractPlainText(item.EndDate);

            var start = ParseDate(startStr);
            var end = ParseDate(endStr) ?? DateTime.UtcNow;

            if (start.HasValue && end >= start.Value) {
                int months = ((end.Year - start.Value.Year) * 12) + end.Month - start.Value.Month + 1;
                totalMonths += Math.Max(1, Math.Min(months, 120));
            } else {
                // Fallback nếu không parse được định dạng ngày tháng: ước tính 1 năm cho mỗi mục
                totalMonths += 12;
            }
        }

        decimal years = (decimal)totalMonths / 12m;
        return Math.Round(Math.Min(years, 20m), 1);
    }

    private static DateTime? ParseDate(string? text) {
        if (string.IsNullOrWhiteSpace(text)) return null;

        var trimmed = text.Trim().ToLowerInvariant();
        if (trimmed == "hiện tại" || trimmed == "present" || trimmed == "now") {
            return DateTime.UtcNow;
        }

        // Match MM/yyyy hoặc yyyy
        var matchYearMonth = Regex.Match(trimmed, @"(\d{1,2})[/.-](\d{4})");
        if (matchYearMonth.Success) {
            if (int.TryParse(matchYearMonth.Groups[1].Value, out var m) &&
                int.TryParse(matchYearMonth.Groups[2].Value, out var y)) {
                return new DateTime(y, Math.Clamp(m, 1, 12), 1);
            }
        }

        var matchYear = Regex.Match(trimmed, @"(\d{4})");
        if (matchYear.Success && int.TryParse(matchYear.Groups[1].Value, out var year)) {
            return new DateTime(year, 1, 1);
        }

        return null;
    }

    private static bool CheckIndustryBonus(CvContentDocument? cv, JobPostingDetailData job) {
        if (cv?.Sections.Experience?.Items == null || job.Industries == null || job.Industries.Count == 0) {
            return false;
        }

        var allExperienceText = string.Join(" ", cv.Sections.Experience.Items.Select(e =>
            $"{CvTiptapDocument.ExtractPlainText(e.Company)} {CvTiptapDocument.ExtractPlainText(e.Position)} {CvTiptapDocument.ExtractPlainText(e.Description)}"))
            .ToLowerInvariant();

        foreach (var ind in job.Industries) {
            if (!string.IsNullOrWhiteSpace(ind.Name) && allExperienceText.Contains(ind.Name.ToLowerInvariant())) {
                return true;
            }
        }

        return false;
    }
}

