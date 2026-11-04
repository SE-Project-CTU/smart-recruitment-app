using System.Text;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Common;

public static class JobTextExtractor {
    public static string ExtractText(JobPosting job) {
        var sb = new StringBuilder();

        sb.AppendLine($"Tiêu đề công việc: {job.Title}");
        if (job.Company != null && !string.IsNullOrWhiteSpace(job.Company.Name)) {
            sb.AppendLine($"Công ty: {job.Company.Name}");
        }

        if (!string.IsNullOrWhiteSpace(job.Description)) {
            sb.AppendLine($"Mô tả: {job.Description}");
        }

        if (!string.IsNullOrWhiteSpace(job.Requirements)) {
            sb.AppendLine($"Yêu cầu: {job.Requirements}");
        }

        if (job.JobSkills?.Count > 0) {
            var skillNames = job.JobSkills
                .Where(js => js.Skill != null && !string.IsNullOrWhiteSpace(js.Skill.Name))
                .Select(js => js.Skill.Name);
            sb.AppendLine($"Kỹ năng yêu cầu: {string.Join(", ", skillNames)}");
        }

        if (job.ExperienceYears.HasValue) {
            sb.AppendLine($"Số năm kinh nghiệm: {job.ExperienceYears.Value} năm");
        }

        return sb.ToString().Trim();
    }

    public static string ExtractText(SmartHire.Application.Abstractions.Persistence.ReadModels.JobPostingDetailData job) {
        var sb = new StringBuilder();

        sb.AppendLine($"Tiêu đề công việc: {job.Title}");
        if (job.Company != null && !string.IsNullOrWhiteSpace(job.Company.Name)) {
            sb.AppendLine($"Công ty: {job.Company.Name}");
        }

        if (!string.IsNullOrWhiteSpace(job.Description)) {
            sb.AppendLine($"Mô tả: {job.Description}");
        }

        if (!string.IsNullOrWhiteSpace(job.Requirements)) {
            sb.AppendLine($"Yêu cầu: {job.Requirements}");
        }

        if (job.Skills?.Count > 0) {
            var skillNames = job.Skills
                .Where(s => !string.IsNullOrWhiteSpace(s.Name))
                .Select(s => s.Name);
            sb.AppendLine($"Kỹ năng yêu cầu: {string.Join(", ", skillNames)}");
        }

        if (job.ExperienceYears.HasValue) {
            sb.AppendLine($"Số năm kinh nghiệm: {job.ExperienceYears.Value} năm");
        }

        return sb.ToString().Trim();
    }

    /// <summary>
    /// Chắt lọc ngữ cảnh cốt lõi của JD (Context Distillation) để giảm 80% Token tiêu thụ
    /// Chỉ giữ lại: Tiêu đề vị trí, Số năm kinh nghiệm, Top kỹ năng và Yêu cầu kỹ thuật ngắn gọn
    /// </summary>
    public static string DistillText(JobPosting job) {
        var sb = new StringBuilder();
        sb.AppendLine($"Vị trí: {job.Title}");

        if (job.ExperienceYears.HasValue) {
            sb.AppendLine($"Kinh nghiệm: {job.ExperienceYears.Value} năm");
        }

        if (job.JobSkills?.Count > 0) {
            var skillNames = job.JobSkills
                .Where(js => js.Skill != null && !string.IsNullOrWhiteSpace(js.Skill.Name))
                .Select(js => js.Skill.Name)
                .Take(8);
            sb.AppendLine($"Kỹ năng trọng tâm: {string.Join(", ", skillNames)}");
        }

        if (!string.IsNullOrWhiteSpace(job.Requirements)) {
            var req = job.Requirements.Trim();
            if (req.Length > 400) {
                req = req.Substring(0, 400) + "...";
            }
            sb.AppendLine($"Yêu cầu chính: {req}");
        }

        return sb.ToString().Trim();
    }

    /// <summary>
    /// Chắt lọc ngữ cảnh cốt lõi của JD từ ReadModel (Context Distillation)
    /// </summary>
    public static string DistillText(SmartHire.Application.Abstractions.Persistence.ReadModels.JobPostingDetailData job) {
        var sb = new StringBuilder();
        sb.AppendLine($"Vị trí: {job.Title}");

        if (job.ExperienceYears.HasValue) {
            sb.AppendLine($"Kinh nghiệm: {job.ExperienceYears.Value} năm");
        }

        if (job.Skills?.Count > 0) {
            var skillNames = job.Skills
                .Where(s => !string.IsNullOrWhiteSpace(s.Name))
                .Select(s => s.Name)
                .Take(8);
            sb.AppendLine($"Kỹ năng trọng tâm: {string.Join(", ", skillNames)}");
        }

        if (!string.IsNullOrWhiteSpace(job.Requirements)) {
            var req = job.Requirements.Trim();
            if (req.Length > 400) {
                req = req.Substring(0, 400) + "...";
            }
            sb.AppendLine($"Yêu cầu chính: {req}");
        }

        return sb.ToString().Trim();
    }
}
