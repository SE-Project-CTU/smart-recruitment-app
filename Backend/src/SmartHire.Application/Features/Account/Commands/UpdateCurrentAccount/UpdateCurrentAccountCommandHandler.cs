using MediatR;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;

namespace SmartHire.Application.Features.Account.UpdateCurrentAccount;

public sealed class UpdateCurrentAccountCommandHandler
    : IRequestHandler<UpdateCurrentAccountCommand, UpdateCurrentAccountResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IBackgroundJobScheduler _backgroundJobScheduler;
    
    public UpdateCurrentAccountCommandHandler(
        ICurrentUser currentUser,
        IUserRepository userRepository,
        IMediaFileRepository mediaFileRepository,
        IBackgroundJobScheduler backgroundJobScheduler
    ) {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _mediaFileRepository = mediaFileRepository;
        _backgroundJobScheduler = backgroundJobScheduler;
    }
    
    public async Task<UpdateCurrentAccountResult> Handle(
        UpdateCurrentAccountCommand request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.",
                [
                    new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
                        "A valid user id claim is required.")
                ]);
        }
        
        var update = UpdateCurrentAccountValidator.ValidateAndNormalize(request);
        
        var user = await _userRepository.GetByIdAsync(
            userId,
            cancellationToken);
        
        if (user is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                AuthErrorCodes.CurrentAccountNotFound,
                "The account was not found.",
                [
                    new AppErrorDetail("account", ErrorDetailReasons.NotFound,
                        "The current account could not be found.")
                ]);
        }
        
        if (update.PhoneProvided &&
            update.Phone is not null &&
            !string.Equals(update.Phone, user.Phone, StringComparison.Ordinal) &&
            await _userRepository.PhoneExistsForOtherUserAsync(
                update.Phone,
                userId,
                cancellationToken)) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.PhoneAlreadyExists,
                "Phone number already exists.",
                [
                    new AppErrorDetail("phone", ErrorDetailReasons.AlreadyExists,
                        "This phone number is already associated with another account.")
                ]);
        }
        
        if (request.AvatarFileIdProvided &&
            request.AvatarFileId is Guid avatarFileId) {
            var avatarFile = await _mediaFileRepository.GetByIdAsync(
                avatarFileId,
                cancellationToken);
            
            if (avatarFile is null) {
                throw new AppException(
                    AppErrorKind.NotFound,
                    AuthErrorCodes.AvatarFileNotFound,
                    "Avatar file was not found.",
                    [
                        new AppErrorDetail("avatarFileId", ErrorDetailReasons.NotFound,
                            "The specified avatar file could not be found.")
                    ]);
            }
            
            if (avatarFile.OwnerId != userId) {
                throw new AppException(
                    AppErrorKind.Forbidden,
                    AuthErrorCodes.AvatarFileNotOwned,
                    "Avatar file does not belong to the current user.",
                    [
                        new AppErrorDetail("avatarFileId", ValidationReasons.NotAllowed,
                            "The avatar file must belong to the current user.")
                    ]);
            }
            
            if (!avatarFile.FileType.StartsWith(
                    "image/",
                    StringComparison.OrdinalIgnoreCase)) {
                throw new AppException(
                    AppErrorKind.Validation,
                    CommonErrorCodes.ValidationError,
                    "Request contains an invalid avatar file.",
                    [
                        new AppErrorDetail(
                            "avatarFileId",
                            ValidationReasons.InvalidFormat,
                            "Avatar file must be an image.")
                    ]);
            }
        }
        
        var now = DateTimeOffset.UtcNow;
        
        var oldAvatarFileId = user.AvatarFileId;
        var newAvatarFileId = request.AvatarFileIdProvided
            ? request.AvatarFileId
            : oldAvatarFileId;
        
        var shouldDeleteOldAvatar =
            request.AvatarFileIdProvided &&
            oldAvatarFileId.HasValue &&
            oldAvatarFileId != newAvatarFileId;
        
        user.UpdateProfile(
            update.FullNameProvided ? update.FullName! : user.FullName,
            update.PhoneProvided ? update.Phone : user.Phone,
            now);
        
        if (request.AvatarFileIdProvided) {
            user.SetAvatarFileId(request.AvatarFileId, now);
        }
        
        await _userRepository.SaveChangeAsync(cancellationToken);
        
        if (shouldDeleteOldAvatar) {
            _backgroundJobScheduler.Enqueue<DeleteMediaFileJob, DeleteMediaFileJobArgs>(
                new DeleteMediaFileJobArgs(oldAvatarFileId!.Value)
            );
        }
        
        // Reuse the existing projection so the response includes the current
        // avatar URL and roles without returning the tracked entity.
        var updatedAccount = await _userRepository.GetCurrentAccountAsync(
            userId,
            cancellationToken);
        
        if (updatedAccount is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                AuthErrorCodes.CurrentAccountNotFound,
                "The account was not found.",
                [
                    new AppErrorDetail("account", ErrorDetailReasons.NotFound,
                        "The updated account could not be loaded.")
                ]);
        }
        
        return new UpdateCurrentAccountResult(
            updatedAccount.Id,
            updatedAccount.Email,
            updatedAccount.Phone,
            updatedAccount.FullName,
            updatedAccount.AvatarUrl,
            updatedAccount.Roles,
            updatedAccount.Status.ToString(),
            updatedAccount.UpdatedAt
        );
    }
}