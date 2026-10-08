using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Auth.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly IRefreshTokenGenerator _refreshTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    
    public LogoutCommandHandler(
        ICurrentUser currentUser,
        IRefreshTokenGenerator refreshTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork
    ) {
        _currentUser = currentUser;
        _refreshTokenGenerator = refreshTokenGenerator;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id."
            );
        }
        
        var now = DateTimeOffset.UtcNow;
        
        await _unitOfWork.ExecuteInTransactionAsync(
            async ct => {
                if (request.AllSessions) {
                    await _refreshTokenRepository
                        .RevokeAllUnrevokedByUserIdAsync(userId, now, ct);
                    
                    return true;
                }
                
                if (string.IsNullOrWhiteSpace(request.RefreshToken)) {
                    throw new AppException(
                        AppErrorKind.BadRequest,
                        AuthErrorCodes.LogoutTargetRequired,
                        "Provide a refresh token or set allSessions to true."
                    );
                }
                
                var hash = _refreshTokenGenerator.Hash(request.RefreshToken);
                var token = await _refreshTokenRepository.GetByHashAsync(hash, ct);
                
                if (token is null) {
                    throw new AppException(
                        AppErrorKind.NotFound,
                        AuthErrorCodes.RefreshTokenNotFound,
                        "Refresh token was not found.");
                }
                
                if (token.UserId != userId) {
                    throw new AppException(
                        AppErrorKind.Forbidden,
                        AuthErrorCodes.RefreshTokenNotOwned,
                        "Refresh token does not belong to the current user."
                    );
                }
                
                await _refreshTokenRepository.TryRevokeAsync(token.Id, now, ct);
                
                return true;
            },
            cancellationToken
        );
    }
}