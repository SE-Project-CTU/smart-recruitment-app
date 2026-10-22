using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Application.Features.Media.Exceptions;
using SmartHire.Application.Features.Media.Mapping;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Commands.UploadPdf;

public sealed class UploadPdfCommandHandler
    : IRequestHandler<UploadPdfCommand, MediaFileResult> {

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

        var sanitizedFileName = UploadPdfCommandValidator.Validate(request);

        // Upload lên storage
        FileUploadResult uploadResult;
        try {
            uploadResult = await _storageService.UploadAsync(
                request.FileStream,
                sanitizedFileName,
                UploadPdfCommandValidator.AllowedPdfMimeType,
                folder: "documents",
                cancellationToken);
        } catch (Exception) {
            throw MediaExceptions.StorageUploadError("PDF");
        }

        var mediaFile = MediaFile.Create(
            ownerId: userId,
            fileName: sanitizedFileName,
            fileUrl: uploadResult.FileUrl,
            fileType: UploadPdfCommandValidator.AllowedPdfMimeType,
            fileSize: request.FileSize,
            publicId: uploadResult.PublicId);

        try {
            await _mediaFileRepository.AddAsync(mediaFile, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        } catch {
            await _storageService.DeleteAsync(uploadResult.PublicId, CancellationToken.None);
            throw;
        }

        return MediaResultMapper.ToMediaFileResult(mediaFile);
    }
}
