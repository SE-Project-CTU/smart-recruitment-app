using System.Text;
using SmartHire.Domain.Entities;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Common;

public static class CvTextExtractor {
    public static string ExtractText(CvVersion cvVersion) {
        var content = cvVersion.Content;
        var sb = new StringBuilder();

        var profileTitle = CvTiptapDocument.ExtractPlainText(content.Profile.Title);
        if (!string.IsNullOrWhiteSpace(profileTitle)) {
            sb.AppendLine($"Vị trí/Chức danh: {profileTitle}");
        }

        var objective = CvTiptapDocument.ExtractPlainText(content.Sections.Objective?.Content);
        if (!string.IsNullOrWhiteSpace(objective)) {
            sb.AppendLine($"Mục tiêu nghề nghiệp: {objective}");
        }

        if (content.Sections.Skills?.Items?.Count > 0) {
            var skills = content.Sections.Skills.Items
                .Select(s => new {
                    Name = CvTiptapDocument.ExtractPlainText(s.Name),
                    Description = CvTiptapDocument.ExtractPlainText(s.Description)
                })
                .Where(s => !string.IsNullOrWhiteSpace(s.Name))
                .Select(s => string.IsNullOrWhiteSpace(s.Description) ? s.Name : $"{s.Name} ({s.Description})");
            sb.AppendLine($"Kỹ năng: {string.Join(", ", skills)}");
        }

        if (content.Sections.Experience?.Items?.Count > 0) {
            sb.AppendLine("Kinh nghiệm làm việc:");
            foreach (var exp in content.Sections.Experience.Items) {
                var position = CvTiptapDocument.ExtractPlainText(exp.Position);
                var company = CvTiptapDocument.ExtractPlainText(exp.Company);
                var desc = CvTiptapDocument.ExtractPlainText(exp.Description);
                sb.AppendLine($"- {position} tại {company}: {desc}");
            }
        }

        if (content.Sections.Projects?.Items?.Count > 0) {
            sb.AppendLine("Dự án:");
            foreach (var proj in content.Sections.Projects.Items) {
                var name = CvTiptapDocument.ExtractPlainText(proj.ProjectName);
                var role = CvTiptapDocument.ExtractPlainText(proj.Role);
                var desc = CvTiptapDocument.ExtractPlainText(proj.Description);
                sb.AppendLine($"- {name} ({role}): {desc}");
            }
        }

        if (content.Sections.Education?.Items?.Count > 0) {
            sb.AppendLine("Học vấn:");
            foreach (var edu in content.Sections.Education.Items) {
                var title = CvTiptapDocument.ExtractPlainText(edu.Title);
                var school = CvTiptapDocument.ExtractPlainText(edu.School);
                var details = CvTiptapDocument.ExtractPlainText(edu.Details);
                sb.AppendLine($"- {title} tại {school}: {details}");
            }
        }

        if (content.Sections.Certifications?.Items?.Count > 0) {
            sb.AppendLine("Chứng chỉ:");
            foreach (var cert in content.Sections.Certifications.Items) {
                var name = CvTiptapDocument.ExtractPlainText(cert.Name);
                if (!string.IsNullOrWhiteSpace(name)) {
                    sb.AppendLine($"- {name}");
                }
            }
        }

        return sb.ToString().Trim();
    }
}
