using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Account.ChangePassword;

public sealed class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ChangePasswordCommandHandler(
        ICurrentUser currentUser,
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(
        ChangePasswordCommand request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is not Guid userId)
        {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        var passwords = ChangePasswordValidator.ValidateAndNormalize(
            request.CurrentPassword,
            request.NewPassword);

        await _unitOfWork.ExecuteInTransactionAsync(
            async transactionToken =>
            {
                var user = await _userRepository.GetByIdAsync(userId, transactionToken);
                if (user is null)
                {
                    throw new AppException(
                        AppErrorKind.NotFound,
                        AuthErrorCodes.CurrentAccountNotFound,
                        "The account was not found.");
                }

                if (user.Status != UserStatus.Active)
                {
                    throw new AppException(
                        AppErrorKind.Forbidden,
                        AuthErrorCodes.AccountNotAllowed,
                        "This account is not allowed to change its password.");
                }

                if (!_passwordHasher.Verify(passwords.CurrentPassword, user.PasswordHash))
                {
                    throw new AppException(
                        AppErrorKind.Unauthorized,
                        AuthErrorCodes.CurrentPasswordInvalid,
                        "Current password is incorrect.");
                }

                if (_passwordHasher.Verify(passwords.NewPassword, user.PasswordHash))
                {
                    throw new AppException(
                        AppErrorKind.Validation,
                        CommonErrorCodes.ValidationError,
                        "New password must be different from the current password.",
                        [new AppErrorDetail(
                            "newPassword",
                            ValidationReasons.MustDiffer,
                            "New password must be different from the current password.")]);
                }

                var now = DateTimeOffset.UtcNow;
                user.ChangePasswordHash(_passwordHasher.Hash(passwords.NewPassword), now);
                await _userRepository.SaveChangeAsync(transactionToken);

                if (request.RevokeAllSessions)
                {
                    await _refreshTokenRepository.RevokeAllUnrevokedByUserIdAsync(
                        userId,
                        now,
                        transactionToken);
                }

                return true;
            },
            cancellationToken);
    }
}
