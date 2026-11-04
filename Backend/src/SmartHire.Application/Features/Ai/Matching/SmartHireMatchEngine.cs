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
        string? rawCvSkillsText = null,
        decimal? semanticVectorSimilarity = null) {
        // Kỹ năng chuyên môn (Mục SKILLS + FuzzySharp + pgvector Semantic)
        var (skillScore, matchingSkills, missingSkills) = SkillMatchEvaluator.Evaluate(cv, job, rawCvSkillsText, semanticVectorSimilarity);

        // Chức danh & Cấp bậc
        var (titleScore, detectedSeniority, targetSeniority) = SeniorityTitleEvaluator.Evaluate(cv, job);

        // Thâm niên kinh nghiệm & Thưởng ngành (+5% Bonus)
        var (expScore, actualYears, requiredYears, hasBonus, bonusPoints) = ExperienceEvaluator.Evaluate(cv, job);

        //  Địa điểm & Học vấn
        decimal otherScore = LocationEducationEvaluator.Evaluate(cv, job);

        // Tính điểm tổng hợp theo Trọng số chuẩn hóa
        decimal wSkill = _weights.Skill;
        decimal wTitle = _weights.Title;
        decimal wExp = _weights.Experience;
        decimal wOther = _weights.Other;

        decimal totalWeight = wSkill + wTitle + wExp + wOther;
        if (totalWeight <= 0) totalWeight = 1.0m;

        decimal weightedScore = ((wSkill * skillScore) +
                                 (wTitle * titleScore) +
                                 (wExp * expScore) +
                                 (wOther * otherScore)) / totalWeight;

        // QUY TẮC BẢO VỆ NĂNG LỰC CỐT LÕI (CORE COMPETENCE GATE):
        // Kỹ năng chuyên môn là điều kiện tiên quyết trong tuyển dụng.
        // Khi Job có yêu cầu kỹ năng nhưng Ứng viên đạt 0% kỹ năng (hoặc dưới 15%):
        // Điểm tổng thể bị chặn trần tối đa 25% - 30% để phản ánh đúng sự lệch pha chuyên môn.
        if (missingSkills.Count > 0 && matchingSkills.Count == 0) {
            weightedScore = Math.Min(weightedScore, 25.0m);
        } else if (skillScore < 30.0m && (missingSkills.Count + matchingSkills.Count) > 0) {
            decimal penaltyFactor = Math.Max(0.40m, skillScore / 30.0m);
            weightedScore = Math.Min(weightedScore, weightedScore * penaltyFactor);
        }

        // QUY TẮC RÀO CHẮN CẤP BẬC & THÂM NIÊN (SENIORITY & EXPERIENCE HARD GATE):
        // Ứng viên Fresher (<= 1.5 năm kinh nghiệm) không thể nhảy cóc lên vị trí Quản lý / Trưởng phòng (>= 5-8 năm).
        // Khi Job yêu cầu cấp bậc TeamLead / DepartmentHead hoặc yêu cầu >= 5 năm kinh nghiệm:
        // Nếu số năm kinh nghiệm thực tế của ứng viên quá thấp (< 40% yêu cầu hoặc <= 1.5 năm):
        // Điểm tổng thể BẮT BUỘC bị khóa trần tối đa 28% - 32%.
        if (requiredYears.HasValue && requiredYears.Value >= 5 && actualYears < (requiredYears.Value * 0.40m)) {
            weightedScore = Math.Min(weightedScore, 30.0m);
        } else if (requiredYears.HasValue && requiredYears.Value >= 3 && actualYears < (requiredYears.Value * 0.35m)) {
            weightedScore = Math.Min(weightedScore, 35.0m);
        }

        if ((job.JobLevel == JobLevel.DepartmentHead || job.JobLevel == JobLevel.TeamLead) && actualYears <= 1.5m) {
            weightedScore = Math.Min(weightedScore, 28.0m);
        }

        // Áp dụng quy tắc Tie-breaker:
        // Điểm thưởng lợi thế chỉ áp dụng khi Điểm năng lực cốt lõi >= 50%
        if (weightedScore < 50m && hasBonus) {
            weightedScore = Math.Max(15m, weightedScore - bonusPoints);
        }

        decimal finalScore = Math.Round(Math.Clamp(weightedScore, 10m, 100m), 2);

        var breakdown = new ScoreBreakdown(
            SkillScore: skillScore,
            TitleScore: titleScore,
            ExperienceScore: expScore,
            OtherScore: otherScore,
            HasPreferentialBonus: hasBonus,
            BonusPoints: bonusPoints
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
        decimal? semanticVectorSimilarity = null) {
        var simulatedDoc = BuildSimulatedDocumentFromText(cvText);
        var rawSkillsText = ExtractSkillsBlock(cvText);
        return Evaluate(simulatedDoc, job, rawCvSkillsText: rawSkillsText, semanticVectorSimilarity: semanticVectorSimilarity);
    }

    public IReadOnlyList<MatchEngineResult> EvaluateBatch(
        CvContentDocument? cv,
        IReadOnlyList<JobPostingDetailData> jobs,
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
                return Evaluate(cv, j, rawCvSkillsText, sim);
            })
            .OrderByDescending(r => r.Score)
            .ThenByDescending(r => r.Breakdown.SkillScore) // Tie-breaker: ưu tiên điểm kỹ năng cao hơn
            .ToList();
    }

    public IReadOnlyList<MatchEngineResult> EvaluateBatchFromText(
        string cvText,
        IReadOnlyList<JobPostingDetailData> jobs,
        IReadOnlyDictionary<Guid, decimal>? semanticVectorSimilarities = null) {
        if (jobs == null || jobs.Count == 0) {
            return Array.Empty<MatchEngineResult>();
        }

        var simulatedDoc = BuildSimulatedDocumentFromText(cvText);
        var rawSkillsText = ExtractSkillsBlock(cvText);
        return EvaluateBatch(simulatedDoc, jobs, rawCvSkillsText: rawSkillsText, semanticVectorSimilarities: semanticVectorSimilarities);
    }

    public static string ExtractSkillsBlock(string cvText) {
        if (string.IsNullOrWhiteSpace(cvText)) return string.Empty;

        var lines = cvText.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var skillsLines = new List<string>();
        bool inSkills = false;

        foreach (var line in lines) {
            var lower = line.ToLowerInvariant();
            if (lower.StartsWith("kỹ năng chuyên môn:") || lower.StartsWith("kỹ năng:") || lower.StartsWith("skills:")) {
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
                    lower.StartsWith("học vấn") || lower.StartsWith("giải thưởng") || lower.StartsWith("chứng chỉ")) {
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
        string profileTitle = string.Empty;
        string currentSection = string.Empty;

        foreach (var line in lines) {
            var lower = line.ToLowerInvariant();

            if (lower.StartsWith("vị trí mục tiêu:") || lower.StartsWith("target role:")) {
                var titleVal = line.Substring(line.IndexOf(':') + 1).Trim();
                if (!string.IsNullOrWhiteSpace(titleVal)) profileTitle = titleVal;
                currentSection = string.Empty;
                continue;
            }

            if (lower.StartsWith("mục tiêu nghề nghiệp:") || lower.StartsWith("objective:")) {
                currentSection = "objective";
                continue;
            }

            if (lower.StartsWith("kỹ năng chuyên môn:") || lower.StartsWith("kỹ năng:") || lower.StartsWith("skills:")) {
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

            if (lower.StartsWith("kinh nghiệm làm việc:") || lower.StartsWith("kinh nghiệm:") || lower.StartsWith("experience:")) {
                currentSection = "experience";
                continue;
            }

            if (lower.StartsWith("dự án tiêu biểu:") || lower.StartsWith("dự án:") || lower.StartsWith("projects:")) {
                currentSection = "projects";
                continue;
            }

            if (lower.StartsWith("giải thưởng") || lower.StartsWith("học vấn") || lower.StartsWith("awards:") || lower.StartsWith("education:")) {
                currentSection = string.Empty;
                continue;
            }

            if (currentSection == "skills") {
                skillsSection.Items.Add(new CvSkillItem {
                    Name = CvTiptapDocument.FromText(line)
                });
            } else if (currentSection == "experience") {
                var dateMatch = Regex.Match(line, @"(\d{2}/\d{4}|\d{4})\s*[-–—]\s*(\d{2}/\d{4}|\d{4}|hiện tại|present|now)", RegexOptions.IgnoreCase);
                if (dateMatch.Success) {
                    experienceSection.Items.Add(new CvExperienceItem {
                        StartDate = CvTiptapDocument.FromText(dateMatch.Groups[1].Value),
                        EndDate = CvTiptapDocument.FromText(dateMatch.Groups[2].Value),
                        Description = CvTiptapDocument.FromText(line)
                    });
                } else {
                    experienceSection.Items.Add(new CvExperienceItem {
                        Description = CvTiptapDocument.FromText(line)
                    });
                }
            } else if (currentSection == "projects") {
                projectsSection.Items.Add(new CvProjectItem {
                    Description = CvTiptapDocument.FromText(line)
                });
            }
        }

        return doc with {
            Profile = doc.Profile with {
                Title = !string.IsNullOrWhiteSpace(profileTitle) ? CvTiptapDocument.FromText(profileTitle) : doc.Profile.Title
            },
            Sections = doc.Sections with {
                Skills = skillsSection,
                Experience = experienceSection,
                Projects = projectsSection
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
