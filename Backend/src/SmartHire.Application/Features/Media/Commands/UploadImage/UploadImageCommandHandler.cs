using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
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

        // Upload lên storage
        FileUploadResult uploadResult;
        try {
            uploadResult = await _storageService.UploadAsync(
                request.FileStream,
                request.FileName,
                request.ContentType,
                folder: "images",
                cancellationToken);
        } catch (Exception ex) {
            throw new AppException(
                AppErrorKind.BadRequest,
                MediaErrorCodes.MediaFileStorageError,
                "Failed to upload image to storage. " + ex.Message);
        }

        // Lưu metadata vào DB
        var mediaFile = MediaFile.Create(
            ownerId: userId,
            fileName: request.FileName,
            fileUrl: uploadResult.FileUrl,
            fileType: request.ContentType,
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
