using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching.Evaluators;

public static class SkillMatchEvaluator {
    public static (decimal Score, IReadOnlyList<string> MatchingSkills, IReadOnlyList<string> MissingSkills) Evaluate(
        CvContentDocument? cv,
        JobPostingDetailData job,
        string? rawCvSkillsText = null,
        decimal? semanticVectorSimilarity = null) {
        // Thu thập danh sách kỹ năng yêu cầu của Job
        var targetSkills = ExtractTargetSkills(job);
        if (targetSkills.Count == 0) {
            return (30.0m, Array.Empty<string>(), Array.Empty<string>());
        }

        // Thu thập danh sách kỹ năng của Ứng viên (Ưu tiên số 1: Section SKILLS)
        var candidateSkills = ExtractCandidateSkills(cv, rawCvSkillsText);

        // Thu thập ngữ cảnh từ Projects và Experience để hỗ trợ đối soát ngữ cảnh nếu ứng viên quên ghi vào Section Skills
        var contextualTokens = ExtractContextualSkillTokens(cv);

        var matchingSkills = new List<string>();
        var missingSkills = new List<string>();
        int demonstratedContextSkillsCount = 0;

        foreach (var target in targetSkills) {
            bool matched = candidateSkills.Any(c => SkillNormalizationMap.IsMatch(c, target));
            if (matched) {
                matchingSkills.Add(target);
            } else if (contextualTokens.Any(c => SkillNormalizationMap.IsMatch(c, target))) {
                // Kỹ năng chưa có trong Section Skills nhưng đã được chứng minh trong Dự án / Kinh nghiệm
                demonstratedContextSkillsCount++;
                missingSkills.Add(target); // Vẫn xếp vào missingSkills để nhắc nhở người dùng bổ sung vào Section Skills
            } else {
                missingSkills.Add(target);
            }
        }

        // Tính điểm độ khớp:
        // - Kỹ năng có trong Section Skills: 1.0 điểm
        // - Kỹ năng được chứng minh qua Dự án/Kinh nghiệm: 0.70 điểm (Partial credit bù đắp)
        decimal totalMatchedPoints = (matchingSkills.Count * 1.0m) + (demonstratedContextSkillsCount * 0.70m);
        decimal matchRate = targetSkills.Count > 0
            ? totalMatchedPoints / targetSkills.Count
            : 1.0m;

        decimal lexicalScore = Math.Round(matchRate * 100m, 2);
        decimal finalScore = lexicalScore;

        // Kết hợp pgvector Semantic Similarity (Hybrid Scoring)
        // Nếu lexical score chưa đạt tối đa nhưng pgvector ghi nhận độ tương đồng ngữ nghĩa cao (ứng viên dùng từ ngữ/văn phong tương đương trong ngành)
        if (semanticVectorSimilarity.HasValue) {
            decimal vectorScore = Math.Clamp(semanticVectorSimilarity.Value * 100m, 0m, 100m);
            if (vectorScore > lexicalScore) {
                // Công thức Hybrid: 75% Lexical+Fuzzy + 25% pgvector Semantic Cosine
                finalScore = Math.Round((0.75m * lexicalScore) + (0.25m * vectorScore), 2);
            }
        }

        return (Math.Clamp(finalScore, 0m, 100m), matchingSkills, missingSkills);
    }

    public static List<string> ExtractTargetSkills(JobPostingDetailData job) {
        var results = new List<string>();

        // Ưu tiên 1: Lấy từ bảng JobSkills (Structured tags)
        if (job.Skills != null && job.Skills.Count > 0) {
            foreach (var s in job.Skills) {
                if (!string.IsNullOrWhiteSpace(s.Name)) {
                    results.Add(s.Name.Trim());
                }
            }
        }

        // Ưu tiên 2: Nếu chưa có tags, bóc tách từ Requirements
        if (results.Count == 0 && !string.IsNullOrWhiteSpace(job.Requirements)) {
            var extracted = ExtractSkillsFromText(job.Requirements);
            results.AddRange(extracted);
        }

        return results.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    public static List<string> ExtractCandidateSkills(CvContentDocument? cv, string? rawCvSkillsText) {
        var skills = new List<string>();

        // Nếu có raw text từ Editor (người dùng bấm Quét lại hoặc đang soạn thảo)
        if (!string.IsNullOrWhiteSpace(rawCvSkillsText)) {
            var parsed = ParseSkillsFromRawText(rawCvSkillsText);
            skills.AddRange(parsed);
        }

        // Đọc từ Section SKILLS trong CV
        if (cv?.Sections.Skills?.Items != null && cv.Sections.Skills.Items.Count > 0) {
            foreach (var item in cv.Sections.Skills.Items) {
                var name = CvTiptapDocument.ExtractPlainText(item.Name);
                if (!string.IsNullOrWhiteSpace(name)) {
                    skills.AddRange(ParseSkillsFromRawText(name));
                }
                var desc = CvTiptapDocument.ExtractPlainText(item.Description);
                if (!string.IsNullOrWhiteSpace(desc)) {
                    skills.AddRange(ParseSkillsFromRawText(desc));
                }
            }
        }

        return skills.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    private static List<string> ExtractContextualSkillTokens(CvContentDocument? cv) {
        if (cv == null) return new List<string>();
        var tokens = new List<string>();

        if (cv.Sections.Experience?.Items != null) {
            foreach (var item in cv.Sections.Experience.Items) {
                var desc = CvTiptapDocument.ExtractPlainText(item.Description);
                if (!string.IsNullOrWhiteSpace(desc)) {
                    tokens.AddRange(ParseSkillsFromRawText(desc));
                }
            }
        }

        if (cv.Sections.Projects?.Items != null) {
            foreach (var item in cv.Sections.Projects.Items) {
                var desc = CvTiptapDocument.ExtractPlainText(item.Description);
                if (!string.IsNullOrWhiteSpace(desc)) {
                    tokens.AddRange(ParseSkillsFromRawText(desc));
                }
            }
        }

        return tokens.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    private static List<string> ParseSkillsFromRawText(string text) {
        if (string.IsNullOrWhiteSpace(text)) return new List<string>();

        var delimiters = new[] { ',', ';', '\n', '\r', '•', '-', '|', '/', '+', '\t' };
        return text.Split(delimiters, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => s.Length >= 2 && !IsGenericWord(s))
            .ToList();
    }

    private static List<string> ExtractSkillsFromText(string text) {
        if (string.IsNullOrWhiteSpace(text)) return new List<string>();

        var list = new List<string>();
        // Tách theo dòng, dấu phẩy, chấm phẩy, gạch đầu dòng, dấu pipe
        var parts = text.Split(new[] { '\n', '\r', ',', ';', '•', '|' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var rawPart in parts) {
            var cleaned = rawPart.TrimStart('-', '•', '*', '+').Trim();

            // Loại bỏ tiền tố nhãn mô tả như "Yêu cầu chuyên môn:", "Yêu cầu kỹ năng:", "Kỹ năng:", "Requirements:"
            cleaned = Regex.Replace(cleaned, @"^(yêu cầu chuyên môn|yêu cầu kỹ năng|yêu cầu|kỹ năng|skills|requirements)\s*:\s*", "", RegexOptions.IgnoreCase).Trim();

            // Nếu phần tử chứa dấu chấm kết thúc câu, chỉ lấy vế kỹ năng trước dấu chấm (tránh câu ghép dài)
            if (cleaned.Contains('.')) {
                var subParts = cleaned.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (subParts.Length > 0) {
                    cleaned = subParts[0].Trim();
                }
            }

            if (cleaned.Length >= 2 && cleaned.Length <= 45 && !IsGenericWord(cleaned) && !IsSentenceTooLong(cleaned)) {
                list.Add(cleaned);
            }
        }

        return list.Distinct(StringComparer.OrdinalIgnoreCase).Take(15).ToList();
    }

    private static bool IsSentenceTooLong(string text) {
        var lower = text.ToLowerInvariant();
        if (lower.Contains("kinh nghiệm thực tế") || lower.Contains("năm kinh nghiệm") || lower.Contains("yêu cầu cấp bậc")) {
            return true;
        }
        return text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length > 5;
    }

    private static bool IsGenericWord(string word) {
        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
            "và", "của", "kỹ năng", "kinh nghiệm", "thành thạo", "hiểu biết", "cơ bản", "nâng cao",
            "skills", "knowledge", "basic", "advanced", "good", "strong", "experience"
        };
        return stopWords.Contains(word);
    }
}
