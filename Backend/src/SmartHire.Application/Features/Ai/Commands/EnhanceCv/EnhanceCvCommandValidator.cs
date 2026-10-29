using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Commands.EnhanceCv;

public static class EnhanceCvCommandValidator {
    private static readonly HashSet<string> AllowedSectionTypes = new(StringComparer.OrdinalIgnoreCase) {
        "WORK_EXPERIENCE",
        "PROJECT",
        "OBJECTIVE",
        "SKILLS",
        "SUMMARY"
    };

    private static readonly HashSet<string> AllowedLanguages = new(StringComparer.OrdinalIgnoreCase) {
        "vi",
        "en"
    };

    public static void Validate(EnhanceCvCommand command) {
        var details = new List<AppErrorDetail>();

        var hasContent = !string.IsNullOrWhiteSpace(command.Content);
        var hasCv = (command.CvId.HasValue && command.CvId.Value != Guid.Empty) ||
                    (command.CvVersionId.HasValue && command.CvVersionId.Value != Guid.Empty);

        if (!hasContent && !hasCv) {
            details.Add(new AppErrorDetail("content", "REQUIRED", "Cần cung cấp nội dung văn bản (content) hoặc chọn hồ sơ CV (cvId / cvVersionId)."));
        } else if (hasContent) {
            var len = command.Content!.Trim().Length;
            if (len < 10 || len > 5000) {
                details.Add(new AppErrorDetail("content", "LENGTH", "Nội dung phải có độ dài từ 10 đến 5000 ký tự."));
            }
        }

        var hasJob = (command.TargetJobId.HasValue && command.TargetJobId.Value != Guid.Empty) ||
                     !string.IsNullOrWhiteSpace(command.TargetJobTitle);

        if (!hasJob) {
            details.Add(new AppErrorDetail("targetJobTitle", "REQUIRED", "Cần cung cấp vị trí mục tiêu (targetJobTitle) hoặc chọn công việc (targetJobId)."));
        } else if (!string.IsNullOrWhiteSpace(command.TargetJobTitle) && command.TargetJobTitle.Trim().Length > 150) {
            details.Add(new AppErrorDetail("targetJobTitle", "MAX_LENGTH", "Tiêu đề vị trí mục tiêu không được vượt quá 150 ký tự."));
        }

        if (!string.IsNullOrWhiteSpace(command.SectionType) && !AllowedSectionTypes.Contains(command.SectionType.Trim())) {
            details.Add(new AppErrorDetail("sectionType", "INVALID_VALUE", "Loại mục phải là WORK_EXPERIENCE, PROJECT, OBJECTIVE, SKILLS hoặc SUMMARY nếu được chỉ định."));
        }

        if (!string.IsNullOrWhiteSpace(command.Language) && !AllowedLanguages.Contains(command.Language.Trim())) {
            details.Add(new AppErrorDetail("language", "INVALID_VALUE", "Ngôn ngữ chỉ hỗ trợ 'vi' hoặc 'en'."));
        }

        if (details.Count > 0) {
            throw AiExceptions.Validation("Dữ liệu yêu cầu không hợp lệ.", details);
        }
    }
}
