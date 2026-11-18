using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching.Evaluators;

public static class ExperienceEvaluator {
    public static (decimal Score, decimal ActualYears, int? RequiredYears) Evaluate(
        CvContentDocument? cv,
        JobPostingDetailData job) {
        decimal actualYears = CalculateExperienceYears(cv);
        int? requiredYears = job.ExperienceYears;

        decimal baseScore;
        if (!requiredYears.HasValue || requiredYears.Value <= 0) {
            // Job không yêu cầu số năm kinh nghiệm cụ thể
            baseScore = 100m;
        } else {
            decimal req = requiredYears.Value;
            if (actualYears >= req) {
                baseScore = 100m;
            } else {
                decimal ratio = actualYears / req;
                baseScore = Math.Round(Math.Clamp(ratio * 100m, 0m, 100m), 2);
            }
        }

        return (baseScore, actualYears, requiredYears);
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
            } else if (start.HasValue) {
                int months = ((DateTime.UtcNow.Year - start.Value.Year) * 12) + DateTime.UtcNow.Month - start.Value.Month + 1;
                totalMonths += Math.Max(1, Math.Min(months, 120));
            } else {
                // Không có ngày tháng cụ thể: kiểm tra nếu là dòng mô tả vị trí thì chỉ ước lượng 3 tháng, không cộng 1 năm
                var desc = CvTiptapDocument.ExtractPlainText(item.Description);
                var pos = CvTiptapDocument.ExtractPlainText(item.Position);
                var comp = CvTiptapDocument.ExtractPlainText(item.Company);
                if (!string.IsNullOrWhiteSpace(pos) || !string.IsNullOrWhiteSpace(comp)) {
                    totalMonths += 3;
                }
            }
        }

        decimal years = (decimal)totalMonths / 12m;
        return Math.Round(Math.Min(years, 30m), 1);
    }

    public static DateTime? ParseDate(string? text) {
        if (string.IsNullOrWhiteSpace(text)) return null;

        var trimmed = text.Trim().ToLowerInvariant();
        if (trimmed == "hiện tại" || trimmed == "present" || trimmed == "now" || trimmed == "current" || trimmed == "nay") {
            return DateTime.UtcNow;
        }

        // 1. Dạng yyyy-MM hoặc yyyy/MM hoặc yyyy.MM (e.g. 2026-05, 2025/07)
        var matchYearFirst = Regex.Match(trimmed, @"\b((?:19|20)\d{2})[-/.](\d{1,2})\b");
        if (matchYearFirst.Success) {
            if (int.TryParse(matchYearFirst.Groups[1].Value, out var y) &&
                int.TryParse(matchYearFirst.Groups[2].Value, out var m)) {
                return new DateTime(y, Math.Clamp(m, 1, 12), 1);
            }
        }

        // 2. Dạng MM/yyyy hoặc MM-yyyy hoặc MM.yyyy (e.g. 05/2026, 5-2025)
        var matchMonthFirst = Regex.Match(trimmed, @"\b(\d{1,2})[-/.]((?:19|20)\d{2})\b");
        if (matchMonthFirst.Success) {
            if (int.TryParse(matchMonthFirst.Groups[1].Value, out var m) &&
                int.TryParse(matchMonthFirst.Groups[2].Value, out var y)) {
                return new DateTime(y, Math.Clamp(m, 1, 12), 1);
            }
        }

        // 3. Chỉ có năm yyyy (e.g. 2025, 2026)
        var matchYear = Regex.Match(trimmed, @"\b((?:19|20)\d{2})\b");
        if (matchYear.Success && int.TryParse(matchYear.Groups[1].Value, out var year)) {
            return new DateTime(year, 1, 1);
        }

        return null;
    }
}

