using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Application.Features.Media.Exceptions;
using SmartHire.Application.Features.Media.Mapping;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Commands.UploadImage;

public sealed class UploadImageCommandHandler
    : IRequestHandler<UploadImageCommand, MediaFileResult> {

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
            throw MediaExceptions.InvalidAccessToken();
        }

        var validated = UploadImageCommandValidator.Validate(request);

        // Upload lên storage
        FileUploadResult uploadResult;
        try {
            uploadResult = await _storageService.UploadAsync(
                request.FileStream,
                validated.SanitizedFileName,
                validated.ActualContentType,
                folder: "images",
                cancellationToken);
        } catch (Exception) {
            throw MediaExceptions.StorageUploadError("image");
        }

        // Lưu metadata vào DB
        var mediaFile = MediaFile.Create(
            ownerId: userId,
            fileName: validated.SanitizedFileName,
            fileUrl: uploadResult.FileUrl,
            fileType: validated.ActualContentType,
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
