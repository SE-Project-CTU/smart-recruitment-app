using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Media.Exceptions;
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
            throw MediaExceptions.InvalidAccessToken();
        }

        // Validate type
        if (!string.Equals(
                request.ContentType,
                AllowedPdfMimeType,
                StringComparison.OrdinalIgnoreCase)) {
            throw MediaExceptions.UnsupportedPdfFormat(request.ContentType);
        }

        // Validate kích thước
        if (request.FileSize > MaxPdfSizeBytes) {
            throw MediaExceptions.PdfSizeExceeded(request.FileSize, MaxPdfSizeBytes);
        }

        // Validate Magic Bytes
        if (!FileSignatureValidator.IsValidPdf(request.FileStream)) {
            throw MediaExceptions.InvalidPdfSignature();
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
        } catch (Exception) {
            throw MediaExceptions.StorageUploadError("PDF");
        }

        var mediaFile = MediaFile.Create(
            ownerId: userId,
            fileName: sanitizedFileName,
            fileUrl: uploadResult.FileUrl,
            fileType: AllowedPdfMimeType,
            fileSize: request.FileSize,
            publicId: uploadResult.PublicId);

        try {
            await _mediaFileRepository.AddAsync(mediaFile, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        } catch {
            await _storageService.DeleteAsync(uploadResult.PublicId, CancellationToken.None);
            throw;
        }

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
