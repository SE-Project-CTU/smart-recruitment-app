using System.Text;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Common;

public static class CvTextExtractor {
    public static string ExtractText(CvVersion cvVersion) {
        var content = cvVersion.Content;
        var sb = new StringBuilder();

        if (!string.IsNullOrWhiteSpace(content.Profile.Title)) {
            sb.AppendLine($"Vị trí/Chức danh: {content.Profile.Title}");
        }

        if (!string.IsNullOrWhiteSpace(content.Sections.Objective?.Content)) {
            sb.AppendLine($"Mục tiêu nghề nghiệp: {content.Sections.Objective.Content}");
        }

        if (content.Sections.Skills?.Items?.Count > 0) {
            var skills = content.Sections.Skills.Items
                .Where(s => !string.IsNullOrWhiteSpace(s.Name))
                .Select(s => string.IsNullOrWhiteSpace(s.Description) ? s.Name : $"{s.Name} ({s.Description})");
            sb.AppendLine($"Kỹ năng: {string.Join(", ", skills)}");
        }

        if (content.Sections.Experience?.Items?.Count > 0) {
            sb.AppendLine("Kinh nghiệm làm việc:");
            foreach (var exp in content.Sections.Experience.Items) {
                sb.AppendLine($"- {exp.Position} tại {exp.Company}: {exp.Description}");
            }
        }

        if (content.Sections.Projects?.Items?.Count > 0) {
            sb.AppendLine("Dự án:");
            foreach (var proj in content.Sections.Projects.Items) {
                sb.AppendLine($"- {proj.ProjectName} ({proj.Role}): {proj.Description}");
            }
        }

        if (content.Sections.Education?.Items?.Count > 0) {
            sb.AppendLine("Học vấn:");
            foreach (var edu in content.Sections.Education.Items) {
                sb.AppendLine($"- {edu.Title} tại {edu.School}: {edu.Details}");
            }
        }

        if (content.Sections.Certifications?.Items?.Count > 0) {
            sb.AppendLine("Chứng chỉ:");
            foreach (var cert in content.Sections.Certifications.Items) {
                sb.AppendLine($"- {cert.Name}");
            }
        }

        return sb.ToString().Trim();
    }
}
