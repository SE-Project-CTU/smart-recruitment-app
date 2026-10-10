using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Commands.UploadPdf;

public sealed class UploadPdfCommandHandler
    : IRequestHandler<UploadPdfCommand, MediaFileResult> {
    private const long MaxPdfSizeBytes = 10 * 1024 * 1024; 
    private const string AllowedPdfMimeType = "application/pdf";

    private readonly ICurrentUser _currentUser;
    private readonly IFileStorageService _storageService;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UploadPdfCommandHandler(
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
        UploadPdfCommand request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        // Validate type
        if (!string.Equals(
                request.ContentType,
                AllowedPdfMimeType,
                StringComparison.OrdinalIgnoreCase)) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "Only PDF files are accepted for this endpoint.",
                [new AppErrorDetail(
                    "file",
                    ValidationReasons.InvalidFormat,
                    $"Content type '{request.ContentType}' is not allowed. Expected: application/pdf.")]);
        }

        // Validate kích thước
        if (request.FileSize > MaxPdfSizeBytes) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "PDF file exceeds the maximum allowed size of 10 MB.",
                [new AppErrorDetail(
                    "file",
                    ValidationReasons.MaxLength,
                    $"File size {request.FileSize} bytes exceeds limit of {MaxPdfSizeBytes} bytes.")]);
        }

        // Validate Magic Bytes
        if (!FileSignatureValidator.IsValidPdf(request.FileStream)) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "The file content does not match a valid PDF signature.",
                [new AppErrorDetail(
                    "file",
                    ValidationReasons.InvalidFormat,
                    "File binary signature does not match PDF format (%PDF-).")]);
        }

        // Chuẩn hóa tên tệp luôn có phần mở rộng .pdf
        var sanitizedFileName = Path.GetExtension(request.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase)
            ? request.FileName
            : Path.ChangeExtension(request.FileName, ".pdf");

        // Upload lên storage
        FileUploadResult uploadResult;
        try {
            uploadResult = await _storageService.UploadAsync(
                request.FileStream,
                sanitizedFileName,
                AllowedPdfMimeType,
                folder: "documents",
                cancellationToken);
        } catch (Exception ex) {
            throw new AppException(
                AppErrorKind.BadRequest,
                MediaErrorCodes.MediaFileStorageError,
                "Failed to upload PDF to storage. " + ex.Message);
        }

        var mediaFile = MediaFile.Create(
            ownerId: userId,
            fileName: sanitizedFileName,
            fileUrl: uploadResult.FileUrl,
            fileType: AllowedPdfMimeType,
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
