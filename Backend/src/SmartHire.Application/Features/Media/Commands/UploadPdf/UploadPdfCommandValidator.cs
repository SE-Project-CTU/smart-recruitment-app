using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Media.Exceptions;

namespace SmartHire.Application.Features.Media.Commands.UploadPdf;

public static class UploadPdfCommandValidator {
    public const long MaxPdfSizeBytes = 10 * 1024 * 1024; // 10 MB
    public const string AllowedPdfMimeType = "application/pdf";

    public static string Validate(UploadPdfCommand request) {
        ArgumentNullException.ThrowIfNull(request);

        if (!string.Equals(request.ContentType, AllowedPdfMimeType, StringComparison.OrdinalIgnoreCase)) {
            throw MediaExceptions.UnsupportedPdfFormat(request.ContentType);
        }

        if (request.FileSize > MaxPdfSizeBytes) {
            throw MediaExceptions.PdfSizeExceeded(request.FileSize, MaxPdfSizeBytes);
        }

        if (!FileSignatureValidator.IsValidPdf(request.FileStream)) {
            throw MediaExceptions.InvalidPdfSignature();
        }

        var sanitizedFileName = Path.GetExtension(request.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase)
            ? request.FileName
            : Path.ChangeExtension(request.FileName, ".pdf");

        return sanitizedFileName;
    }
}
