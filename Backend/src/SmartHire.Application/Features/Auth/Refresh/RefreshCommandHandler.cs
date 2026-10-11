using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Auth.Refresh;

public sealed class RefreshCommandHandler : IRequestHandler<RefreshCommand, RefreshResult> {
    private readonly IRefreshTokenGenerator _refreshTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAccessTokenGenerator _accessTokenGenerator;
    
    public RefreshCommandHandler(
        IRefreshTokenGenerator refreshTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork,
        IAccessTokenGenerator accessTokenGenerator
    ) {
        _refreshTokenGenerator = refreshTokenGenerator;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _accessTokenGenerator = accessTokenGenerator;
    }
    
    public async Task<RefreshResult> Handle(RefreshCommand request, CancellationToken cancellationToken) {
        if (request is null || string.IsNullOrWhiteSpace(request.RefreshToken)) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "A refresh token is required."
            );
        }
        
        var now = DateTimeOffset.UtcNow;
        var tokenHash = _refreshTokenGenerator.Hash(request.RefreshToken);
        
        var oldToken = await _refreshTokenRepository.GetByHashAsync(tokenHash, cancellationToken);
        
        if (
            oldToken is null ||
            oldToken.ExpiresAt <= now
        ) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidRefreshToken,
                "Refresh token is invalid or expired."
            );
        }
        
        if (oldToken.RevokedAt is not null) {
            await _refreshTokenRepository.RevokeAllUnrevokedByUserIdAsync(oldToken.UserId, now, cancellationToken);
            
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidRefreshToken,
                "Security alert: Refresh token reuse detected. All sessions have been revoked."
            );
        }
        
        if (oldToken.UserStatus != UserStatus.Active) {
            throw new AppException(
                AppErrorKind.Forbidden,
                AuthErrorCodes.AccountNotAllowed,
                "Account is forbidden."
            );
        }
        
        bool isConcurrentReplayDetected = false;
        RefreshResult? result = null;
        
        result = await _unitOfWork.ExecuteInTransactionAsync(async ct => {
                var revoked = await _refreshTokenRepository.TryRevokeForRefreshAsync(
                    oldToken.Id, now, ct
                );
                
                if (!revoked) {
                    isConcurrentReplayDetected = true;
                    return null!;
                }
                
                var accessToken = _accessTokenGenerator.Generate(
                    oldToken.UserId,
                    oldToken.Email,
                    oldToken.FullName,
                    oldToken.RoleNames
                );
                
                var newRefreshToken = _refreshTokenGenerator.Generate(now);
                
                var newRefreshTokenEntity = RefreshToken.Create(
                    oldToken.UserId,
                    newRefreshToken.Hash,
                    newRefreshToken.ExpiresAt,
                    now
                );
                
                await _refreshTokenRepository.AddAsync(newRefreshTokenEntity, ct);
                await _unitOfWork.SaveChangesAsync(ct);
                
                var expiresIn = Math.Max(0, (int)(accessToken.ExpiresAt - now).TotalSeconds);
                
                return new RefreshResult(
                    AccessToken: accessToken.Value,
                    TokenType: "Bearer",
                    ExpiresIn: expiresIn,
                    RefreshToken: newRefreshToken.Value,
                    RefreshTokenExpiresAt: newRefreshToken.ExpiresAt
                );
            }, cancellationToken
        );
        
        if (isConcurrentReplayDetected) {
            await _refreshTokenRepository.RevokeAllUnrevokedByUserIdAsync(oldToken.UserId, now, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken); // 🟢 GHI VĨNH VIỄN VÀO DB
            
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidRefreshToken,
                "Security alert: Concurrent token replay detected. All sessions have been revoked."
            );
        }
        
        return result;
    }
}