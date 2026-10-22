using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Application.Features.Media.Exceptions;

namespace SmartHire.Application.Features.Media.Commands.DeleteMediaFile;

public sealed class DeleteMediaFileCommandHandler
    : IRequestHandler<DeleteMediaFileCommand, DeleteMediaFileResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IFileStorageService _storageService;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteMediaFileCommandHandler(
        ICurrentUser currentUser,
        IMediaFileRepository mediaFileRepository,
        IFileStorageService storageService,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _mediaFileRepository = mediaFileRepository;
        _storageService = storageService;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteMediaFileResult> Handle(
        DeleteMediaFileCommand request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw MediaExceptions.InvalidAccessToken();
        }

        var mediaFile = await _mediaFileRepository.GetByIdAsync(
            request.FileId,
            cancellationToken);

        if (mediaFile is null) {
            throw MediaExceptions.MediaFileNotFound();
        }

        // Kiểm tra quyền sở hữu
        var isAdmin = _currentUser.Roles.Contains(
            RoleNames.Admin,
            StringComparer.OrdinalIgnoreCase);

        if (!isAdmin && mediaFile.OwnerId != userId) {
            throw MediaExceptions.MediaFileForbidden();
        }

        // Xóa trên Cloudinary trước
        try {
            await _storageService.DeleteAsync(mediaFile.PublicId, cancellationToken);
        } catch (Exception) {
            throw MediaExceptions.StorageDeleteError();
        }

        _mediaFileRepository.Delete(mediaFile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DeleteMediaFileResult(mediaFile.Id, Deleted: true);
    }
}
