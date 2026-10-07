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
        
        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
                var oldToken = await _refreshTokenRepository.GetByHashAsync(tokenHash, ct);
                
                if (
                    oldToken is null ||
                    oldToken.RevokedAt is not null ||
                    oldToken.ExpiresAt <= now
                ) {
                    throw new AppException(
                        AppErrorKind.Unauthorized,
                        AuthErrorCodes.InvalidRefreshToken,
                        "Refresh token is invalid or expired."
                    );
                }
                
                if (oldToken.UserStatus != UserStatus.Active) {
                    throw new AppException(
                        AppErrorKind.Forbidden,
                        AuthErrorCodes.AccountNotAllowed,
                        "Account is forbidden."
                    );
                }
                
                var revoked = await _refreshTokenRepository.TryRevokeForRefreshAsync(
                    oldToken.Id, now, ct
                );
                
                if (!revoked) {
                    throw new AppException(
                        AppErrorKind.Unauthorized,
                        AuthErrorCodes.InvalidRefreshToken,
                        "Refresh token is invalid or expired.");
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
                
                var expiresIn = Math.Max(0, (int)(accessToken.ExpiresAt - now).TotalMilliseconds);
                
                return new RefreshResult(
                    AccessToken: accessToken.Value,
                    TokenType: "Bearer",
                    ExpiresIn: expiresIn,
                    RefreshToken: newRefreshToken.Value,
                    RefreshTokenExpiresAt: newRefreshToken.ExpiresAt
                );
            }, cancellationToken
        );
    }
}