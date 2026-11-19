using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching.Evaluators;

public static class LocationEducationEvaluator {
    public static decimal Evaluate(CvContentDocument? cv, JobPostingDetailData job) {
        // Đánh giá Địa điểm
        decimal locationScore = EvaluateLocation(cv, job);

        // Đánh giá Học vấn (Đạt = 100%, Không đạt = 0%)
        decimal educationScore = EvaluateEducation(cv, job);

        decimal score = (locationScore * 0.50m) + (educationScore * 0.50m);
        return Math.Round(Math.Clamp(score, 0m, 100m), 2);
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

        bool isSameProvince = IsProvinceMatch(candidateAddress, jobProvince);
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

    public static bool IsProvinceMatch(string candidateAddress, string jobProvince) {
        if (string.IsNullOrWhiteSpace(candidateAddress) || string.IsNullOrWhiteSpace(jobProvince)) return false;

        var normCand = NormalizeLocationText(candidateAddress);
        var normJob = NormalizeLocationText(jobProvince);

        if (normCand.Contains(normJob) || normJob.Contains(normCand)) {
            return true;
        }

        // Bảng đối chiếu các đô thị và tỉnh thành phố trọng điểm
        var provinceAliases = new (string Alias, string Canonical)[] {
            ("can tho", "can tho"),
            ("ho chi minh", "ho chi minh"),
            ("hcm", "ho chi minh"),
            ("sai gon", "ho chi minh"),
            ("ha noi", "ha noi"),
            ("da nang", "da nang"),
            ("hai phong", "hai phong"),
            ("binh duong", "binh duong"),
            ("dong nai", "dong nai"),
            ("ba ria", "ba ria vung tau"),
            ("vung tau", "ba ria vung tau"),
            ("can tho city", "can tho")
        };

        foreach (var (alias, canonical) in provinceAliases) {
            if (normCand.Contains(alias) && normJob.Contains(canonical)) return true;
        }

        return false;
    }

    private static string NormalizeLocationText(string text) {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var cleaned = text.ToLowerInvariant();
        // Bỏ tiền tố hành chính: thành phố, tỉnh, tp., tp, quận, huyện, thị xã
        cleaned = Regex.Replace(cleaned, @"\b(thành phố|tỉnh|tp\.|tp|quận|huyện|thị xã|city|province)\b", " ", RegexOptions.IgnoreCase);
        // Bỏ dấu tiếng Việt
        cleaned = RemoveDiacritics(cleaned).Trim();
        cleaned = Regex.Replace(cleaned, @"\s+", " ");
        return cleaned;
    }

    private static string RemoveDiacritics(string text) {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder(capacity: normalizedString.Length);

        for (int i = 0; i < normalizedString.Length; i++) {
            char c = normalizedString[i];
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark) {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder
            .ToString()
            .Normalize(NormalizationForm.FormC)
            .Replace("đ", "d")
            .Replace("Đ", "D");
    }

    private static decimal EvaluateEducation(CvContentDocument? cv, JobPostingDetailData job) {
        if (!job.EducationLevel.HasValue || job.EducationLevel == EducationLevel.NoRequirement) {
            return 100m;
        }

        if (cv?.Sections.Education?.Items == null || cv.Sections.Education.Items.Count == 0) {
            return 0m; // Không có thông tin học vấn -> trừ thẳng tay 0%
        }

        var allEduText = string.Join(" ", cv.Sections.Education.Items.Select(e =>
            $"{CvTiptapDocument.ExtractPlainText(e.Title)} {CvTiptapDocument.ExtractPlainText(e.School)} {CvTiptapDocument.ExtractPlainText(e.Details)}"))
            .ToLowerInvariant();

        bool hasPostgrad = allEduText.Contains("thạc sĩ") || allEduText.Contains("master") || allEduText.Contains("tiến sĩ") ||
                           allEduText.Contains("phd") || allEduText.Contains("tiến sỹ") || allEduText.Contains("sau đại học") ||
                           allEduText.Contains("postgraduate");

        bool hasBachelor = hasPostgrad ||
                           allEduText.Contains("đại học") || allEduText.Contains("cử nhân") || allEduText.Contains("kỹ sư") ||
                           allEduText.Contains("bachelor") || allEduText.Contains("university") || allEduText.Contains("b.s.") ||
                           allEduText.Contains("b.a.") || allEduText.Contains("b.eng") || allEduText.Contains("undergraduate") ||
                           allEduText.Contains("software engineering") || allEduText.Contains("công nghệ thông tin") ||
                           allEduText.Contains("computer science") || allEduText.Contains("gpa");

        bool hasCollege = hasBachelor ||
                          allEduText.Contains("cao đẳng") || allEduText.Contains("college") || allEduText.Contains("associate") ||
                          allEduText.Contains("trung cấp");

        return job.EducationLevel switch {
            EducationLevel.Postgraduate => hasPostgrad ? 100m : 0m,
            EducationLevel.Bachelor => hasBachelor ? 100m : 0m,
            EducationLevel.College => hasCollege ? 100m : 0m,
            _ => 100m
        };
    }
}

