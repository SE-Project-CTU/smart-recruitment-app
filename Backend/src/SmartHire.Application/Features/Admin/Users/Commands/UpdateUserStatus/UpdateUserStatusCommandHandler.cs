using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.Users.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Users.Commands.UpdateUserStatus;

public sealed class UpdateUserStatusCommandHandler
    : IRequestHandler<UpdateUserStatusCommand, UpdateUserStatusResult> {
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserStatusCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork) {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateUserStatusResult> Handle(
        UpdateUserStatusCommand request,
        CancellationToken cancellationToken) {
        var command = UpdateUserStatusCommandValidator.Validate(request);

        var user = await _userRepository.GetByIdWithRolesAsync(command.UserId, cancellationToken);
        if (user is null) {
            throw AdminExceptions.UserNotFound(command.UserId);
        }

        if (user.Status == command.Status) {
            throw AdminExceptions.Conflict(
                AdminErrorCodes.InvalidStatusTransition,
                $"User is already in '{command.Status}' status.",
                "status");
        }

        // Không cho phép khóa hoặc vô hiệu hóa Admin cuối cùng
        if ((command.Status == UserStatus.Locked || command.Status == UserStatus.Inactive) &&
            user.UserRoles.Any(ur => ur.Role.Name == RoleNames.Admin)) {
            var activeAdminCount = await _userRepository.CountActiveAdminsAsync(cancellationToken);
            if (activeAdminCount <= 1) {
                throw AdminExceptions.CannotLockLastAdmin();
            }
        }

        var now = DateTimeOffset.UtcNow;
        var tokensRevoked = false;

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            if (command.Status == UserStatus.Locked) {
                user.Lock(now);
                await _refreshTokenRepository.RevokeAllUnrevokedByUserIdAsync(user.Id, now, ct);
                tokensRevoked = true;
            } else if (command.Status == UserStatus.Inactive) {
                user.Deactivate(now);
                await _refreshTokenRepository.RevokeAllUnrevokedByUserIdAsync(user.Id, now, ct);
                tokensRevoked = true;
            } else if (command.Status == UserStatus.Active) {
                user.Unlock(now);
            }

            await _unitOfWork.SaveChangesAsync(ct);

            return new UpdateUserStatusResult(
                user.Id,
                user.Status.ToString().ToUpperInvariant(),
                tokensRevoked,
                user.UpdatedAt
            );
        }, cancellationToken);
    }
}
