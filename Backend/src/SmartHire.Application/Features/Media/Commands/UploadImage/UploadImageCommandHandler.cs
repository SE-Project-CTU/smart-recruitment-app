using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Commands.UploadImage;

public sealed class UploadImageCommandHandler
    : IRequestHandler<UploadImageCommand, MediaFileResult> {
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedImageMimeTypes =
        ["image/jpeg", "image/png", "image/webp"];

    private readonly ICurrentUser _currentUser;
    private readonly IFileStorageService _storageService;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UploadImageCommandHandler(
        ICurrentUser currentUser,
        IFileStorageService storageService,
        IMediaFileRepository mediaFileRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _storageService = storageService;
        _mediaFileRepository = mediaFileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<MediaFileResult> Handle(
        UploadImageCommand request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        // Validate type
        if (!AllowedImageMimeTypes.Contains(
                request.ContentType,
                StringComparer.OrdinalIgnoreCase)) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "Unsupported image format. Accepted: jpg, jpeg, png, webp.",
                [new AppErrorDetail(
                    "file",
                    ValidationReasons.InvalidFormat,
                    $"Content type '{request.ContentType}' is not allowed.")]);
        }

        // Validate kích thước
        if (request.FileSize > MaxImageSizeBytes) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "Image file exceeds the maximum allowed size of 5 MB.",
                [new AppErrorDetail(
                    "file",
                    ValidationReasons.MaxLength,
                    $"File size {request.FileSize} bytes exceeds limit of {MaxImageSizeBytes} bytes.")]);
        }

        // Validate Magic Bytes
        var detectedContentType = FileSignatureValidator.DetectImageContentType(request.FileStream);
        if (detectedContentType is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "The file content does not match a valid image signature (JPEG, PNG, WEBP).",
                [new AppErrorDetail(
                    "file",
                    ValidationReasons.InvalidFormat,
                    "File binary signature does not match allowed image formats.")]);
        }

        // Tự động chuẩn hóa
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

        // Upload lên storage
        FileUploadResult uploadResult;
        try {
            uploadResult = await _storageService.UploadAsync(
                request.FileStream,
                sanitizedFileName,
                actualContentType,
                folder: "images",
                cancellationToken);
        } catch (Exception ex) {
            throw new AppException(
                AppErrorKind.BadRequest,
                MediaErrorCodes.MediaFileStorageError,
                "Failed to upload image to storage. " + ex.Message);
        }

        // Lưu metadata vào DB với actualContentType và sanitizedFileName
        var mediaFile = MediaFile.Create(
            ownerId: userId,
            fileName: sanitizedFileName,
            fileUrl: uploadResult.FileUrl,
            fileType: actualContentType,
            fileSize: request.FileSize,
            publicId: uploadResult.PublicId);

        await _mediaFileRepository.AddAsync(mediaFile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new MediaFileResult(
            mediaFile.Id,
            mediaFile.OwnerId,
            mediaFile.FileName,
            mediaFile.FileUrl,
            mediaFile.FileType,
            mediaFile.FileSize,
            mediaFile.CreatedAt);
    }
}
