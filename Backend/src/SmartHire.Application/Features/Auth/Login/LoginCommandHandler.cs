using MediatR;
using Microsoft.IdentityModel.Tokens.Experimental;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Auth.RegisterAccount;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Auth.Login;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult> {
    private readonly IUserRepository _userRepository;
    private readonly IAccessTokenGenerator _accessTokenGenerator;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IRefreshTokenGenerator _refreshTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;
    
    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IAccessTokenGenerator accessTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository,
        IRefreshTokenGenerator refreshTokenGenerator,
        IUnitOfWork unitOfWork
    ) {
        _userRepository = userRepository;
        _accessTokenGenerator = accessTokenGenerator;
        _passwordHasher = passwordHasher;
        _refreshTokenRepository = refreshTokenRepository;
        _refreshTokenGenerator = refreshTokenGenerator;
        _unitOfWork = unitOfWork;
    }
    
    
    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken) {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailWithRolesAsync(email, cancellationToken);
        
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash)) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidCredentials,
                "Email or Password does not match"
            );
        }
        
        if (user.Status != UserStatus.Active) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.AccountNotAllowed,
                "Account is not allowed to log in"
            );
        }
        
        IReadOnlyList<string> roleNames = user.UserRoles.Select(r => r.Role.Name).ToList();
        
        var now = DateTimeOffset.UtcNow;
        var accessToken = _accessTokenGenerator.Generate(
            user.Id,
            user.Email,
            user.FullName,
            roleNames
        );
        
        var refreshToken = _refreshTokenGenerator.Generate(now);
        
        var refreshTokenEntity = RefreshToken.Create(
            user.Id,
            refreshToken.Hash,
            refreshToken.ExpiresAt,
            now
        );
        
        return await _unitOfWork.ExecuteInTransactionAsync(
            async transactionToken => {
                await _refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);
                
                await _unitOfWork.SaveChangesAsync(transactionToken);
                
                var expiresIn = Math.Max(0, (int)(accessToken.ExpiresAt - now).TotalMilliseconds);
                
                return new LoginResult(
                    AccessToken: accessToken.Value,
                    TokenType: "Bearer",
                    ExpiresIn: expiresIn,
                    RefreshToken: refreshToken.Value,
                    RefreshTokenExpiresAt: refreshToken.ExpiresAt,
                    User: new LoginUserResult(
                        user.Id,
                        user.Email,
                        user.FullName,
                        roleNames,
                        user.Status.ToString()
                    )
                );
            },
            cancellationToken
        );
    }
}