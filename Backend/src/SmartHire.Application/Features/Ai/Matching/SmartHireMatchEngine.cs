using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Ai.Matching.Evaluators;
using SmartHire.Application.Features.Ai.Matching.Models;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching;

public sealed class SmartHireMatchEngine : ISmartHireMatchEngine {
    private readonly MatchingWeightsOptions _weights;

    public SmartHireMatchEngine(MatchingWeightsOptions? options = null) {
        _weights = options ?? new MatchingWeightsOptions();
    }

    public MatchEngineResult Evaluate(
        CvContentDocument? cv,
        JobPostingDetailData job,
        decimal experienceScore,
        string? rawCvSkillsText = null,
        decimal? semanticVectorSimilarity = null) {
        // Kỹ năng chuyên môn (Mục SKILLS + pgvector Semantic)
        var (skillScore, matchingSkills, missingSkills) = SkillMatchEvaluator.Evaluate(cv, job, rawCvSkillsText, semanticVectorSimilarity);

        // Chức danh & Cấp bậc
        var (titleScore, detectedSeniority, targetSeniority) = SeniorityTitleEvaluator.Evaluate(cv, job);

        // Thâm niên kinh nghiệm thực tế
        var expScore = Math.Round(Math.Clamp(experienceScore, 0m, 100m), 2);
        var actualYears = ExperienceEvaluator.CalculateExperienceYears(cv);
        var requiredYears = job.ExperienceYears;

        // Địa điểm & Học vấn (Pass: 100% / Fail: 0%)
        decimal otherScore = LocationEducationEvaluator.Evaluate(cv, job);

        // Tính điểm tổng hợp theo Trọng số do HR cấu hình (hoặc fallback mặc định)
        decimal wSkill = job.MatchingWeights?.SkillWeight ?? _weights.Skill;
        decimal wTitle = job.MatchingWeights?.TitleWeight ?? _weights.Title;
        decimal wExp = job.MatchingWeights?.ExperienceWeight ?? _weights.Experience;
        decimal wOther = job.MatchingWeights?.OtherWeight ?? _weights.Other;

        decimal totalWeight = wSkill + wTitle + wExp + wOther;
        if (totalWeight <= 0) totalWeight = 1.0m;

        decimal weightedScore = ((wSkill * skillScore) +
                                 (wTitle * titleScore) +
                                 (wExp * expScore) +
                                 (wOther * otherScore)) / totalWeight;

        decimal finalScore = Math.Round(Math.Clamp(weightedScore, 0m, 100m), 2);

        var breakdown = new ScoreBreakdown(
            SkillScore: skillScore,
            TitleScore: titleScore,
            ExperienceScore: expScore,
            OtherScore: otherScore,
            SkillWeight: wSkill,
            TitleWeight: wTitle,
            ExperienceWeight: wExp,
            OtherWeight: wOther
        );

        string summary = GenerateRuleBasedSummary(finalScore, job, matchingSkills, missingSkills, actualYears, requiredYears, detectedSeniority, targetSeniority);

        return new MatchEngineResult(
            JobId: job.Id,
            Score: finalScore,
            Breakdown: breakdown,
            MatchingSkills: matchingSkills,
            MissingSkills: missingSkills,
            ExpYearsActual: actualYears,
            ExpYearsRequired: requiredYears,
            DetectedSeniority: detectedSeniority,
            TargetSeniority: targetSeniority,
            Summary: summary
        );
    }

    public MatchEngineResult EvaluateFromText(
        string cvText,
        JobPostingDetailData job,
        decimal experienceScore,
        decimal? semanticVectorSimilarity = null) {
        var simulatedDoc = BuildSimulatedDocumentFromText(cvText);
        var rawSkillsText = ExtractSkillsBlock(cvText);
        return Evaluate(simulatedDoc, job, experienceScore, rawCvSkillsText: rawSkillsText, semanticVectorSimilarity: semanticVectorSimilarity);
    }

    public IReadOnlyList<MatchEngineResult> EvaluateBatch(
        CvContentDocument? cv,
        IReadOnlyList<JobPostingDetailData> jobs,
        IReadOnlyDictionary<Guid, decimal> experienceScores,
        string? rawCvSkillsText = null,
        IReadOnlyDictionary<Guid, decimal>? semanticVectorSimilarities = null) {
        if (jobs == null || jobs.Count == 0) {
            return Array.Empty<MatchEngineResult>();
        }

        return jobs
            .Select(j => {
                decimal? sim = null;
                if (semanticVectorSimilarities != null && semanticVectorSimilarities.TryGetValue(j.Id, out var s)) {
                    sim = s;
                }
                var experienceScore = experienceScores.TryGetValue(j.Id, out var score) ? score : 0m;
                return Evaluate(cv, j, experienceScore, rawCvSkillsText, sim);
            })
            .OrderByDescending(r => r.Score)
            .ThenByDescending(r => r.Breakdown.SkillScore) // Tie-breaker: ưu tiên điểm kỹ năng cao hơn
            .ToList();
    }

    public IReadOnlyList<MatchEngineResult> EvaluateBatchFromText(
        string cvText,
        IReadOnlyList<JobPostingDetailData> jobs,
        IReadOnlyDictionary<Guid, decimal> experienceScores,
        IReadOnlyDictionary<Guid, decimal>? semanticVectorSimilarities = null) {
        if (jobs == null || jobs.Count == 0) {
            return Array.Empty<MatchEngineResult>();
        }

        var simulatedDoc = BuildSimulatedDocumentFromText(cvText);
        var rawSkillsText = ExtractSkillsBlock(cvText);
        return EvaluateBatch(simulatedDoc, jobs, experienceScores, rawCvSkillsText: rawSkillsText, semanticVectorSimilarities: semanticVectorSimilarities);
    }

    public static string ExtractSkillsBlock(string cvText) {
        if (string.IsNullOrWhiteSpace(cvText)) return string.Empty;

        var lines = cvText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var skillsLines = new List<string>();
        bool inSkills = false;

        foreach (var line in lines) {
            var lower = line.ToLowerInvariant();
            if (lower.StartsWith("kỹ năng chuyên môn:") || lower.StartsWith("kỹ năng:") || lower.StartsWith("skills:") ||
                lower == "skills" || lower == "kỹ năng" || lower == "kỹ năng chuyên môn") {
                inSkills = true;
                int colonIdx = line.IndexOf(':');
                if (colonIdx >= 0 && colonIdx < line.Length - 1) {
                    var rest = line.Substring(colonIdx + 1).Trim();
                    if (!string.IsNullOrWhiteSpace(rest)) skillsLines.Add(rest);
                }
                continue;
            }

            if (inSkills) {
                if (lower.StartsWith("kinh nghiệm") || lower.StartsWith("dự án") || lower.StartsWith("mục tiêu") ||
                    lower.StartsWith("học vấn") || lower.StartsWith("giải thưởng") || lower.StartsWith("chứng chỉ") ||
                    lower.StartsWith("work experience") || lower.StartsWith("experience") || lower.StartsWith("projects") ||
                    lower.StartsWith("education") || lower.StartsWith("certifications") || lower.StartsWith("awards") ||
                    lower == "education" || lower == "work experience" || lower == "projects" || lower == "certifications" ||
                    lower == "học vấn" || lower == "kinh nghiệm làm việc") {
                    break;
                }
                skillsLines.Add(line);
            }
        }

        return string.Join("\n", skillsLines);
    }

    public static CvContentDocument BuildSimulatedDocumentFromText(string cvText) {
        var doc = new CvContentDocument();
        if (string.IsNullOrWhiteSpace(cvText)) return doc;

        var lines = cvText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var skillsSection = new CvItemSection<CvSkillItem>();
        var experienceSection = new CvItemSection<CvExperienceItem>();
        var projectsSection = new CvItemSection<CvProjectItem>();
        var educationSection = new CvItemSection<CvEducationItem>();
        string profileTitle = string.Empty;
        string profileAddress = string.Empty;
        string currentSection = string.Empty;

        foreach (var line in lines) {
            var lower = line.ToLowerInvariant();

            if (lower.StartsWith("vị trí mục tiêu:") || lower.StartsWith("target role:") || lower.StartsWith("chức danh:") || lower.StartsWith("title:")) {
                var titleVal = line.Substring(line.IndexOf(':') + 1).Trim();
                if (!string.IsNullOrWhiteSpace(titleVal)) profileTitle = titleVal;
                currentSection = string.Empty;
                continue;
            }

            if (lower.StartsWith("địa chỉ:") || lower.StartsWith("address:") || lower.StartsWith("location:") || lower.StartsWith("khu vực:")) {
                var addrVal = line.Substring(line.IndexOf(':') + 1).Trim();
                if (!string.IsNullOrWhiteSpace(addrVal)) profileAddress = addrVal;
                currentSection = string.Empty;
                continue;
            }

            if (lower.StartsWith("mục tiêu nghề nghiệp:") || lower.StartsWith("objective:") || lower == "objective" || lower == "mục tiêu nghề nghiệp") {
                currentSection = "objective";
                continue;
            }

            if (lower.StartsWith("kỹ năng chuyên môn:") || lower.StartsWith("kỹ năng:") || lower.StartsWith("skills:") ||
                lower == "skills" || lower == "kỹ năng" || lower == "kỹ năng chuyên môn") {
                currentSection = "skills";
                int colonIdx = line.IndexOf(':');
                if (colonIdx >= 0 && colonIdx < line.Length - 1) {
                    var rest = line.Substring(colonIdx + 1).Trim();
                    if (!string.IsNullOrWhiteSpace(rest)) {
                        skillsSection.Items.Add(new CvSkillItem { Name = CvTiptapDocument.FromText(rest) });
                    }
                }
                continue;
            }

            if (lower.StartsWith("kinh nghiệm làm việc:") || lower.StartsWith("kinh nghiệm:") || lower.StartsWith("experience:") ||
                lower == "experience" || lower == "work experience" || lower == "kinh nghiệm làm việc") {
                currentSection = "experience";
                continue;
            }

            if (lower.StartsWith("dự án tiêu biểu:") || lower.StartsWith("dự án:") || lower.StartsWith("projects:") ||
                lower == "projects" || lower == "dự án") {
                currentSection = "projects";
                continue;
            }

            if (lower.StartsWith("học vấn:") || lower.StartsWith("education:") || lower == "education" || lower == "học vấn") {
                currentSection = "education";
                continue;
            }

            if (lower.StartsWith("giải thưởng") || lower.StartsWith("awards:") || lower.StartsWith("chứng chỉ") || lower.StartsWith("certifications:")) {
                currentSection = string.Empty;
                continue;
            }

            if (currentSection == "skills") {
                skillsSection.Items.Add(new CvSkillItem {
                    Name = CvTiptapDocument.FromText(line)
                });
            } else if (currentSection == "experience") {
                // Nhận diện linh hoạt ngày tháng: yyyy-MM, yyyy/MM, MM/yyyy, MM-yyyy, yyyy, present/hiện tại
                var dateMatch = Regex.Match(
                    line,
                    @"\b((?:19|20)\d{2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{4}|(?:19|20)\d{2})\s*[-–—~tođến]+\s*((?:19|20)\d{2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{4}|(?:19|20)\d{2}|hiện tại|present|now|current|nay)\b",
                    RegexOptions.IgnoreCase);

                if (dateMatch.Success) {
                    experienceSection.Items.Add(new CvExperienceItem {
                        StartDate = CvTiptapDocument.FromText(dateMatch.Groups[1].Value),
                        EndDate = CvTiptapDocument.FromText(dateMatch.Groups[2].Value),
                        Description = CvTiptapDocument.FromText(line)
                    });
                } else if (experienceSection.Items.Count > 0) {
                    // Ghép bullet points hoặc chi tiết mô tả vào mục kinh nghiệm gần nhất
                    var lastItem = experienceSection.Items[^1];
                    var currentDesc = CvTiptapDocument.ExtractPlainText(lastItem.Description);
                    var updatedDesc = string.IsNullOrWhiteSpace(currentDesc) ? line : $"{currentDesc}\n{line}";
                    experienceSection.Items[^1] = lastItem with {
                        Description = CvTiptapDocument.FromText(updatedDesc)
                    };
                } else {
                    experienceSection.Items.Add(new CvExperienceItem {
                        Description = CvTiptapDocument.FromText(line)
                    });
                }
            } else if (currentSection == "projects") {
                projectsSection.Items.Add(new CvProjectItem {
                    Description = CvTiptapDocument.FromText(line)
                });
            } else if (currentSection == "education") {
                educationSection.Items.Add(new CvEducationItem {
                    School = CvTiptapDocument.FromText(line),
                    Title = CvTiptapDocument.FromText(line),
                    Details = CvTiptapDocument.FromText(line)
                });
            }
        }

        return doc with {
            Profile = doc.Profile with {
                Title = !string.IsNullOrWhiteSpace(profileTitle) ? CvTiptapDocument.FromText(profileTitle) : doc.Profile.Title,
                Address = !string.IsNullOrWhiteSpace(profileAddress) ? CvTiptapDocument.FromText(profileAddress) : doc.Profile.Address
            },
            Sections = doc.Sections with {
                Skills = skillsSection,
                Experience = experienceSection,
                Projects = projectsSection,
                Education = educationSection
            }
        };
    }

    private static string GenerateRuleBasedSummary(
        decimal score,
        JobPostingDetailData job,
        IReadOnlyList<string> matchingSkills,
        IReadOnlyList<string> missingSkills,
        decimal actualYears,
        int? requiredYears,
        string detectedSeniority,
        string targetSeniority) {
        if (score <= 35m && requiredYears.HasValue && requiredYears.Value >= 4 && actualYears < (requiredYears.Value * 0.40m)) {
            return $"Hồ sơ có khoảng cách lớn về kinh nghiệm ({actualYears:F1} năm so với yêu cầu {requiredYears.Value} năm) cho cấp bậc {targetSeniority} của vị trí {job.Title}. Điểm số bị giới hạn trần để bảo đảm tiêu chuẩn tuyển dụng thực tế.";
        }
        if (score >= 80m) {
            return $"Hồ sơ có độ tương thích rất cao ({score}%) với vị trí {job.Title}. Đã đáp ứng {matchingSkills.Count} kỹ năng cốt lõi và phù hợp cấp bậc {targetSeniority}.";
        }
        if (score >= 60m) {
            var missingHint = missingSkills.Count > 0 ? $" Cần bổ sung hoặc làm nổi bật thêm kỹ năng: {string.Join(", ", missingSkills.Take(3))}." : "";
            return $"Hồ sơ đáp ứng tương đối tốt ({score}%) yêu cầu của vị trí {job.Title}.{missingHint}";
        }
        if (score >= 40m) {
            var expHint = requiredYears.HasValue ? $" Tin tuyển dụng yêu cầu {requiredYears} năm kinh nghiệm (hiện có {actualYears:F1} năm)." : "";
            return $"Hồ sơ ở mức tiềm năng ({score}%).{expHint} Nên tối ưu lại kỹ năng trọng tâm theo bản mô tả công việc để tăng khả năng trúng tuyển.";
        }
        return $"Hồ sơ hiện tại có độ tương đồng thấp ({score}%) với vị trí {job.Title}. Cần đào tạo thêm các kỹ năng chuyên môn cốt lõi trước khi ứng tuyển.";
    }
}
