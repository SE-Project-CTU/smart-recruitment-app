using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Abstractions.Storage;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;

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
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.",
                [new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
                    "A valid user id claim is required.")]);
        }

        var mediaFile = await _mediaFileRepository.GetByIdAsync(
            request.FileId,
            cancellationToken);

        if (mediaFile is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                MediaErrorCodes.MediaFileNotFound,
                "Media file was not found.",
                [new AppErrorDetail("fileId", ErrorDetailReasons.NotFound,
                    "The specified media file could not be found.")]);
        }

        // Kiểm tra quyền sở hữu
        var isAdmin = _currentUser.Roles.Contains(
            RoleNames.Admin,
            StringComparer.OrdinalIgnoreCase);

        if (!isAdmin && mediaFile.OwnerId != userId) {
            throw new AppException(
                AppErrorKind.Forbidden,
                MediaErrorCodes.MediaFileForbidden,
                "You do not have permission to delete this file.",
                [new AppErrorDetail("fileId", ValidationReasons.NotAllowed,
                    "The current account does not own this media file.")]);
        }

        // Xóa trên Cloudinary trước
        try {
            await _storageService.DeleteAsync(mediaFile.PublicId, cancellationToken);
        } catch (Exception) {
            throw new AppException(
                AppErrorKind.BadRequest,
                MediaErrorCodes.MediaFileDeleteStorageError,
                "Failed to delete file from storage.",
                [new AppErrorDetail("file", ErrorDetailReasons.StorageError,
                    "The storage provider could not delete the file.")]);
        }

        _mediaFileRepository.Delete(mediaFile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DeleteMediaFileResult(mediaFile.Id, Deleted: true);
    }
}
