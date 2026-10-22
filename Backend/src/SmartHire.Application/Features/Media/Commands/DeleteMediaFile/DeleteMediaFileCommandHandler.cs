using MediatR;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Application.Features.Media.Exceptions;
using SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;
using SmartHire.Application.Features.Media.Mapping;

namespace SmartHire.Application.Features.Media.Commands.DeleteMediaFile;

public sealed class DeleteMediaFileCommandHandler
    : IRequestHandler<DeleteMediaFileCommand, DeleteMediaFileResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IBackgroundJobScheduler _backgroundJobScheduler;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteMediaFileCommandHandler(
        ICurrentUser currentUser,
        IMediaFileRepository mediaFileRepository,
        IBackgroundJobScheduler backgroundJobScheduler,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _mediaFileRepository = mediaFileRepository;
        _backgroundJobScheduler = backgroundJobScheduler;
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

        // Kiểm tra ràng buộc khóa ngoại trước khi xóa
        var isReferenced = await _mediaFileRepository.IsReferencedAsync(request.FileId, cancellationToken);
        if (isReferenced) {
            throw MediaExceptions.MediaFileInUse();
        }

        // Soft delete trong database trước
        mediaFile.MarkAsDeleted(DateTimeOffset.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Gọi xóa vật lý trên Cloudinary qua Hangfire background job
        _backgroundJobScheduler.Enqueue<DeleteMediaFileJob, DeleteMediaFileJobArgs>(
            new DeleteMediaFileJobArgs(mediaFile.Id)
        );

        return MediaResultMapper.ToDeleteMediaFileResult(mediaFile);
    }
}
