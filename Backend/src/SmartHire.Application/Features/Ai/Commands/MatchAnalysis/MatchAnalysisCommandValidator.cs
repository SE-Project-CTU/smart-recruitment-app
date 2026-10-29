using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Commands.MatchAnalysis;

public static class MatchAnalysisCommandValidator {
    public static void Validate(MatchAnalysisCommand command) {
        var details = new List<AppErrorDetail>();

        if (command.JobId == Guid.Empty) {
            details.Add(new AppErrorDetail("jobId", "REQUIRED", "Mã tin tuyển dụng không được để trống."));
        }

        if ((!command.CvId.HasValue || command.CvId.Value == Guid.Empty) &&
            (!command.CvVersionId.HasValue || command.CvVersionId.Value == Guid.Empty)) {
            details.Add(new AppErrorDetail("cvId", "REQUIRED", "Cần cung cấp cvId hoặc cvVersionId."));
        }

        if (details.Count > 0) {
            throw AiExceptions.Validation("Dữ liệu yêu cầu không hợp lệ.", details);
        }
    }
}
