using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Account.UpdateCurrentAccount;

public sealed class UpdateCurrentAccountCommandHandler
    : IRequestHandler<UpdateCurrentAccountCommand, UpdateCurrentAccountResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    
    public UpdateCurrentAccountCommandHandler(
        ICurrentUser currentUser,
        IUserRepository userRepository,
        IMediaFileRepository mediaFileRepository) {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _mediaFileRepository = mediaFileRepository;
    }
    
    public async Task<UpdateCurrentAccountResult> Handle(
        UpdateCurrentAccountCommand request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }
        
        var update = UpdateCurrentAccountValidator.ValidateAndNormalize(request);
        
        var user = await _userRepository.GetByIdAsync(
            userId,
            cancellationToken);
        
        if (user is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                AuthErrorCodes.CurrentAccountNotFound,
                "The account was not found.");
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
                "Phone number already exists.");
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
                    "Avatar file was not found.");
            }
            
            if (avatarFile.OwnerId != userId) {
                throw new AppException(
                    AppErrorKind.Forbidden,
                    AuthErrorCodes.AvatarFileNotOwned,
                    "Avatar file does not belong to the current user.");
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
        user.UpdateProfile(
            update.FullNameProvided ? update.FullName! : user.FullName,
            update.PhoneProvided ? update.Phone : user.Phone,
            now);
        
        if (request.AvatarFileIdProvided) {
            user.SetAvatarFileId(request.AvatarFileId, now);
        }
        
        await _userRepository.SaveChangeAsync(cancellationToken);
        
        // Reuse the existing projection so the response includes the current
        // avatar URL and roles without returning the tracked entity.
        var updatedAccount = await _userRepository.GetCurrentAccountAsync(
            userId,
            cancellationToken);
        
        if (updatedAccount is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                AuthErrorCodes.CurrentAccountNotFound,
                "The account was not found.");
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