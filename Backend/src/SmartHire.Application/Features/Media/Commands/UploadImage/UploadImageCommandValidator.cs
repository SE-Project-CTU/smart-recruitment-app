using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Media.Exceptions;

namespace SmartHire.Application.Features.Media.Commands.UploadImage;

public static class UploadImageCommandValidator {
    public const long MaxImageSizeBytes = 5 * 1024 * 1024; // 5 MB
    public static readonly string[] AllowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    public sealed record ValidatedImageResult(string SanitizedFileName, string ActualContentType);

    public static ValidatedImageResult Validate(UploadImageCommand request) {
        ArgumentNullException.ThrowIfNull(request);

        if (!AllowedImageMimeTypes.Contains(request.ContentType, StringComparer.OrdinalIgnoreCase)) {
            throw MediaExceptions.UnsupportedImageFormat(request.ContentType);
        }

        if (request.FileSize > MaxImageSizeBytes) {
            throw MediaExceptions.ImageSizeExceeded(request.FileSize, MaxImageSizeBytes);
        }

        var detectedContentType = FileSignatureValidator.DetectImageContentType(request.FileStream);
        if (detectedContentType is null) {
            throw MediaExceptions.InvalidImageSignature();
        }

        var actualContentType = detectedContentType;
        var currentExtension = Path.GetExtension(request.FileName).ToLowerInvariant();
        var isExtensionCompatible = actualContentType switch {
            "image/jpeg" => currentExtension is ".jpg" or ".jpeg",
            "image/png" => currentExtension is ".png",
            "image/webp" => currentExtension is ".webp",
            _ => false
        };

        var sanitizedFileName = isExtensionCompatible
            ? request.FileName
            : Path.ChangeExtension(request.FileName, actualContentType switch {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => currentExtension
            });

        return new ValidatedImageResult(sanitizedFileName, actualContentType);
    }
}
