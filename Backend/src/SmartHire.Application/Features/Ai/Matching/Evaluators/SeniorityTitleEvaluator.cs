using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching.Evaluators;

public static class SeniorityTitleEvaluator {
    public static (decimal Score, string DetectedSeniority, string TargetSeniority) Evaluate(
        CvContentDocument? cv,
        JobPostingDetailData job) {
        var targetJobTitle = job.Title ?? string.Empty;
        var targetLevel = job.JobLevel;

        var cvTitle = ExtractCvTitle(cv);
        var detectedLevel = DetectSeniorityLevel(cvTitle, cv);

        var targetSeniorityStr = FormatJobLevel(targetLevel, targetJobTitle);
        var detectedSeniorityStr = FormatSeniority(detectedLevel);

        // Điểm tương đồng Chức danh (Title Similarity): 60%
        decimal titleSimilarity = ComputeTitleSimilarity(cvTitle, targetJobTitle);

        // Điểm tương đồng Cấp bậc (Seniority Similarity): 40%
        decimal seniorityScore = ComputeSeniorityScore(detectedLevel, targetLevel, targetJobTitle);
        // Nếu chức danh hoàn toàn không liên quan (Title Similarity <= 25%), chiết giảm điểm cấp bậc
        // vì cấp bậc chuyên môn ở ngành khác không thể tự động chuyển giao nguyên vẹn sang ngành này
        if (titleSimilarity <= 25m) {
            seniorityScore = Math.Min(seniorityScore, 30m);
        }

        decimal finalScore = Math.Round((titleSimilarity * 0.60m) + (seniorityScore * 0.40m), 2);
        return (Math.Clamp(finalScore, 10m, 100m), detectedSeniorityStr, targetSeniorityStr);
    }

    private static string ExtractCvTitle(CvContentDocument? cv) {
        if (cv == null) return string.Empty;

        var profileTitle = CvTiptapDocument.ExtractPlainText(cv.Profile.Title);
        if (!string.IsNullOrWhiteSpace(profileTitle)) return profileTitle;

        if (cv.Sections.Experience?.Items != null && cv.Sections.Experience.Items.Count > 0) {
            var firstPosition = CvTiptapDocument.ExtractPlainText(cv.Sections.Experience.Items[0].Position);
            if (!string.IsNullOrWhiteSpace(firstPosition)) return firstPosition;
        }

        return string.Empty;
    }

    private static int DetectSeniorityLevel(string title, CvContentDocument? cv) {
        var text = title.ToLowerInvariant();
        decimal actualYears = ExperienceEvaluator.CalculateExperienceYears(cv);

        int levelFromTitle = 0;
        if (text.Contains("director") || text.Contains("giám đốc") || text.Contains("head")) levelFromTitle = 7;
        else if (text.Contains("lead") || text.Contains("trưởng nhóm") || text.Contains("supervisor") || text.Contains("quản lý") || text.Contains("manager")) levelFromTitle = 6;
        else if (text.Contains("senior") || text.Contains("chuyên viên chính") || text.Contains("sr.") || text.Contains("sr ")) levelFromTitle = 5;
        else if (text.Contains("middle") || text.Contains("mid-level") || text.Contains("chuyên viên")) levelFromTitle = 4;
        else if (text.Contains("junior") || text.Contains("jr.") || text.Contains("jr ")) levelFromTitle = 3;
        else if (text.Contains("fresher") || text.Contains("mới tốt nghiệp")) levelFromTitle = 2;
        else if (text.Contains("intern") || text.Contains("thực tập")) levelFromTitle = 1;

        if (levelFromTitle > 0) {
            // RÀNG BUỘC THỰC TẾ (SANITY CHECK):
            // Số năm kinh nghiệm là bằng chứng thép. Nếu kinh nghiệm <= 1.5 năm (Fresher):
            // Cấp bậc thực tế không thể vượt quá Junior (Level 3), bất kể chức danh có ghi Trưởng phòng hay Giám đốc.
            if (actualYears <= 1.5m && levelFromTitle >= 4) {
                return 2; // Khóa trần ở Fresher / Junior
            }
            if (actualYears <= 3.0m && levelFromTitle >= 6) {
                return 4; // Khóa trần ở Middle
            }
            return levelFromTitle;
        }

        // Ước lượng qua số năm kinh nghiệm nếu title không ghi rõ cấp bậc
        if (actualYears >= 5m) return 5; // Senior
        if (actualYears >= 2m) return 4; // Middle
        if (actualYears >= 1m) return 3; // Junior
        return 2; // Staff / Fresher
    }

    private static int MapJobLevelToRank(JobLevel? level, string jobTitle) {
        var lowerTitle = jobTitle.ToLowerInvariant();
        if (lowerTitle.Contains("senior") || lowerTitle.Contains("sr.") || lowerTitle.Contains("sr ")) return 5;
        if (lowerTitle.Contains("lead") || lowerTitle.Contains("trưởng nhóm")) return 6;
        if (lowerTitle.Contains("intern") || lowerTitle.Contains("thực tập")) return 1;
        if (lowerTitle.Contains("fresher")) return 2;

        return level switch {
            JobLevel.Intern => 1,
            JobLevel.Staff => 3,
            JobLevel.TeamLead => 6,
            JobLevel.Supervisor => 6,
            JobLevel.DepartmentHead => 7,
            JobLevel.BranchManager => 7,
            JobLevel.DeputyDirector => 8,
            JobLevel.Director => 8,
            JobLevel.Executive => 8,
            _ => 4
        };
    }

    private static decimal ComputeSeniorityScore(int candidateRank, JobLevel? jobLevel, string jobTitle) {
        int targetRank = MapJobLevelToRank(jobLevel, jobTitle);

        if (candidateRank >= targetRank) {
            return 100m;
        }

        int gap = targetRank - candidateRank;
        return Math.Max(20m, 100m - (gap * 25m));
    }

    private static decimal ComputeTitleSimilarity(string cvTitle, string jobTitle) {
        if (string.IsNullOrWhiteSpace(cvTitle) || string.IsNullOrWhiteSpace(jobTitle)) return 40m;

        var cvTokens = Tokenize(cvTitle);
        var jobTokens = Tokenize(jobTitle);

        if (jobTokens.Count == 0) return 50m;

        int matches = jobTokens.Count(jt => cvTokens.Any(ct =>
            ct.Equals(jt, StringComparison.OrdinalIgnoreCase) ||
            ct.Contains(jt, StringComparison.OrdinalIgnoreCase) ||
            jt.Contains(ct, StringComparison.OrdinalIgnoreCase)));

        decimal ratio = (decimal)matches / jobTokens.Count;
        return Math.Round(Math.Clamp(ratio * 100m, 20m, 100m), 2);
    }

    private static HashSet<string> Tokenize(string text) {
        var delimiters = new[] { ' ', ',', '/', '-', '(', ')', '|', '&' };
        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
            "và", "của", "cho", "với", "tại", "tuyển", "cần", "vị", "trí", "and", "the", "for", "with", "in", "of"
        };

        return text.ToLowerInvariant()
            .Split(delimiters, StringSplitOptions.RemoveEmptyEntries)
            .Where(t => t.Length >= 2 && !stopWords.Contains(t))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private static int CalculateTotalExperienceYears(CvContentDocument? cv) {
        if (cv?.Sections.Experience?.Items == null || cv.Sections.Experience.Items.Count == 0) return 0;
        return Math.Min(cv.Sections.Experience.Items.Count, 10);
    }

    private static string FormatSeniority(int rank) => rank switch {
        1 => "Intern",
        2 => "Fresher",
        3 => "Junior",
        4 => "Middle",
        5 => "Senior",
        6 => "Lead / Supervisor",
        >= 7 => "Manager / Director",
        _ => "Staff"
    };

    private static string FormatJobLevel(JobLevel? level, string jobTitle) {
        var lowerTitle = jobTitle.ToLowerInvariant();
        if (lowerTitle.Contains("senior")) return "Senior";
        if (lowerTitle.Contains("lead")) return "Lead";
        if (lowerTitle.Contains("junior")) return "Junior";
        if (lowerTitle.Contains("intern")) return "Intern";

        return level?.ToString() ?? "Staff";
    }
}

