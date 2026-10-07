using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Auth.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand> {
    private readonly IRefreshTokenGenerator _refreshTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    
    public LogoutCommandHandler(
        IRefreshTokenGenerator refreshTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork
    ) {
        _refreshTokenGenerator = refreshTokenGenerator;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken) {
        var now = DateTimeOffset.UtcNow;
        
        await _unitOfWork.ExecuteInTransactionAsync(
            async ct => {
                if (request.AllSessions) {
                    await _refreshTokenRepository
                        .RevokeAllUnrevokedByUserIdAsync(request.UserId, now, ct);
                    
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
                
                if (token.UserId != request.UserId) {
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
