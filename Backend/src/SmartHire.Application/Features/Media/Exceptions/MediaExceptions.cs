using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Media.Exceptions;

public static class MediaExceptions {
    public static AppException InvalidAccessToken(string? message = null) => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        message ?? "The access token does not contain a valid user id.",
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat, "A valid user id claim is required.")]);

    public static AppException Validation(string message, IEnumerable<AppErrorDetail>? details = null) => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        message,
        details?.ToArray() ?? Array.Empty<AppErrorDetail>());

    public static AppException FileRequired(string fileType = "file") => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        $"{char.ToUpperInvariant(fileType[0]) + fileType[1..]} is required.",
        [new AppErrorDetail("file", ValidationReasons.Required, "A file must be provided.")]);

    public static AppException UnsupportedImageFormat(string? contentType = null) => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        "Unsupported image format. Accepted: jpg, jpeg, png, webp.",
        [new AppErrorDetail("file", ValidationReasons.InvalidFormat, $"Content type '{contentType}' is not allowed.")]);

    public static AppException ImageSizeExceeded(long fileSize, long maxSizeBytes) => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        $"Image file exceeds the maximum allowed size of {maxSizeBytes / (1024 * 1024)} MB.",
        [new AppErrorDetail("file", ValidationReasons.MaxLength, $"File size {fileSize} bytes exceeds limit of {maxSizeBytes} bytes.")]);

    public static AppException InvalidImageSignature() => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        "The file content does not match a valid image signature (JPG, JPEG, PNG, WEBP).",
        [new AppErrorDetail("file", ValidationReasons.InvalidFormat, "File binary signature does not match allowed image formats.")]);

    public static AppException UnsupportedPdfFormat(string? contentType = null) => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        "Only PDF files are accepted for this endpoint.",
        [new AppErrorDetail("file", ValidationReasons.InvalidFormat, $"Content type '{contentType}' is not allowed. Expected: application/pdf.")]);

    public static AppException PdfSizeExceeded(long fileSize, long maxSizeBytes) => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        $"PDF file exceeds the maximum allowed size of {maxSizeBytes / (1024 * 1024)} MB.",
        [new AppErrorDetail("file", ValidationReasons.MaxLength, $"File size {fileSize} bytes exceeds limit of {maxSizeBytes} bytes.")]);

    public static AppException InvalidPdfSignature() => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        "The file content does not match a valid PDF signature.",
        [new AppErrorDetail("file", ValidationReasons.InvalidFormat, "File binary signature does not match PDF format (%PDF-).")]);

    public static AppException MediaFileNotFound() => new(
        AppErrorKind.NotFound,
        MediaErrorCodes.MediaFileNotFound,
        "Media file was not found.",
        [new AppErrorDetail("fileId", ErrorDetailReasons.NotFound, "The specified media file could not be found.")]);

    public static AppException MediaFileForbidden() => new(
        AppErrorKind.Forbidden,
        MediaErrorCodes.MediaFileForbidden,
        "You do not have permission to delete this file.",
        [new AppErrorDetail("fileId", ValidationReasons.NotAllowed, "The current account does not own this media file.")]);

    public static AppException StorageUploadError(string mediaType = "image") => new(
        AppErrorKind.BadRequest,
        MediaErrorCodes.MediaFileStorageError,
        $"Failed to upload {mediaType} to storage.",
        [new AppErrorDetail("file", ErrorDetailReasons.StorageError, $"The storage provider could not store the {mediaType}.")]);

    public static AppException StorageDeleteError() => new(
        AppErrorKind.BadRequest,
        MediaErrorCodes.MediaFileDeleteStorageError,
        "Failed to delete file from storage.",
        [new AppErrorDetail("file", ErrorDetailReasons.StorageError, "The storage provider could not delete the file.")]);
}
