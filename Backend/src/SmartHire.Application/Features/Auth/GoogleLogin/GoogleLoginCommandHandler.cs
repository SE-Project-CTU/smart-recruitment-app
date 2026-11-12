using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Auth.Login;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Auth.GoogleLogin;

public sealed class GoogleLoginCommandHandler : IRequestHandler<GoogleLoginCommand, LoginResult> {
    private sealed record ValidatedGoogleLogin(string IdToken, string? NormalizedRole);

    private readonly IFirebaseTokenVerifier _firebaseTokenVerifier;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IAccessTokenGenerator _accessTokenGenerator;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IRefreshTokenGenerator _refreshTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public GoogleLoginCommandHandler(
        IFirebaseTokenVerifier firebaseTokenVerifier,
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IAccessTokenGenerator accessTokenGenerator,
        IRefreshTokenRepository refreshTokenRepository,
        IRefreshTokenGenerator refreshTokenGenerator,
        IUnitOfWork unitOfWork
    ) {
        _firebaseTokenVerifier = firebaseTokenVerifier;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _accessTokenGenerator = accessTokenGenerator;
        _refreshTokenRepository = refreshTokenRepository;
        _refreshTokenGenerator = refreshTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResult> Handle(
        GoogleLoginCommand request,
        CancellationToken cancellationToken
    ) {
        var valid = Validate(request);

        var firebaseUser = await _firebaseTokenVerifier.VerifyIdTokenAsync(
            valid.IdToken,
            cancellationToken);

        if (!firebaseUser.EmailVerified || string.IsNullOrWhiteSpace(firebaseUser.Email)) {
            throw new AppException(
                AppErrorKind.BadRequest,
                AuthErrorCodes.GoogleEmailNotVerified,
                "Your Google account email address is not verified.",
                [new AppErrorDetail("email", ValidationReasons.NotAllowed,
                    "Verified Google email address is required.")]);
        }

        var normalizedEmail = firebaseUser.Email.Trim().ToLowerInvariant();
        var existingUser = await _userRepository.GetTrackedForGoogleAuthAsync(
            firebaseUser.Uid,
            normalizedEmail,
            cancellationToken);

        if (existingUser is not null) {
            return await HandleExistingUserAsync(existingUser, firebaseUser, valid.NormalizedRole, cancellationToken);
        }

        if (valid.NormalizedRole is null) {
            throw new AppException(
                AppErrorKind.Validation,
                AuthErrorCodes.GoogleRoleRequired,
                "Please select a role (Candidate or Recruiter) to complete account registration.",
                [new AppErrorDetail("role", ValidationReasons.Required,
                    "Role selection is required for first-time Google sign-in.")]);
        }

        return await CreateGoogleUserAndSignInAsync(
            firebaseUser,
            normalizedEmail,
            valid.NormalizedRole,
            cancellationToken);
    }

    private static ValidatedGoogleLogin Validate(GoogleLoginCommand command) {
        if (string.IsNullOrWhiteSpace(command.IdToken)) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "Request contains invalid fields.",
                [new AppErrorDetail("idToken", ValidationReasons.Required,
                    "Firebase ID token is required.")]);
        }

        string? normalizedRole = null;
        if (!string.IsNullOrWhiteSpace(command.Role)) {
            var trimmedRole = command.Role.Trim();
            if (string.Equals(trimmedRole, RoleNames.Candidate, StringComparison.OrdinalIgnoreCase)) {
                normalizedRole = RoleNames.Candidate;
            } else if (string.Equals(trimmedRole, RoleNames.Recruiter, StringComparison.OrdinalIgnoreCase)) {
                normalizedRole = RoleNames.Recruiter;
            } else {
                throw new AppException(
                    AppErrorKind.Validation,
                    AuthErrorCodes.InvalidRole,
                    $"Role '{trimmedRole}' is invalid for Google sign-in. Allowed values are Candidate or Recruiter.",
                    [new AppErrorDetail("role", ValidationReasons.NotAllowed,
                        "Allowed roles are Candidate or Recruiter.")]);
            }
        }

        return new ValidatedGoogleLogin(command.IdToken.Trim(), normalizedRole);
    }

    private async Task<LoginResult> HandleExistingUserAsync(
        User user,
        VerifiedFirebaseUser firebaseUser,
        string? requestedRole,
        CancellationToken cancellationToken
    ) {
        if (user.Status != UserStatus.Active) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.AccountNotAllowed,
                "This account is not allowed to sign in.",
                [new AppErrorDetail("account.status", ValidationReasons.NotAllowed,
                    "The account is not active.")]);
        }

        var roleNames = user.UserRoles
            .Select(ur => ur.Role.Name)
            .ToList();

        if (roleNames.Any(r => string.Equals(r, RoleNames.Admin, StringComparison.OrdinalIgnoreCase))) {
            throw new AppException(
                AppErrorKind.Forbidden,
                AuthErrorCodes.AccountNotAllowed,
                "Administrator accounts are not permitted to sign in with Google.",
                [new AppErrorDetail("role", ValidationReasons.NotAllowed,
                    "Administrator accounts must sign in with email and password.")]);
        }

        if (requestedRole is not null &&
            !roleNames.Any(r => string.Equals(r, requestedRole, StringComparison.OrdinalIgnoreCase))) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.GoogleRoleMismatch,
                $"This Google email is already registered with role: {string.Join(", ", roleNames)}.",
                [new AppErrorDetail("role", ErrorDetailReasons.AlreadyExists,
                    "Account already exists with a different role.")]);
        }

        if (!string.IsNullOrEmpty(user.FirebaseUid) &&
            !string.Equals(user.FirebaseUid, firebaseUser.Uid, StringComparison.Ordinal)) {
            throw UidConflictException();
        }

        var now = DateTimeOffset.UtcNow;
        user.LinkFirebaseAccount(firebaseUser.Uid, firebaseUser.AvatarUrl, now);

        return await IssueSessionTokensAsync(user, roleNames, isNewUser: false, now, cancellationToken);
    }

    private async Task<LoginResult> CreateGoogleUserAndSignInAsync(
        VerifiedFirebaseUser firebaseUser,
        string normalizedEmail,
        string roleName,
        CancellationToken cancellationToken
    ) {
        var role = await _roleRepository.GetByNameAsync(roleName, cancellationToken);
        if (role is null) {
            var code = roleName == RoleNames.Candidate
                ? AuthErrorCodes.CandidateRoleNotFound
                : AuthErrorCodes.RecruiterRoleNotFound;

            throw new AppException(
                AppErrorKind.NotFound,
                code,
                $"Required role '{roleName}' was not found.",
                [new AppErrorDetail("role", ErrorDetailReasons.NotFound,
                    $"The required role '{roleName}' is not configured.")]);
        }

        var now = DateTimeOffset.UtcNow;
        var user = User.CreateWithGoogle(
            normalizedEmail,
            firebaseUser.FullName ?? string.Empty,
            firebaseUser.Uid,
            firebaseUser.AvatarUrl,
            now);

        try {
            return await IssueSessionTokensAsync(
                user,
                new[] { role.Name },
                isNewUser: true,
                now,
                cancellationToken,
                assignedRole: role);
        }
        catch (PersistenceUniqueConstraintViolationException exception)
            when (string.Equals(exception.ConstraintName, "ix_users_email", StringComparison.OrdinalIgnoreCase)
                  || string.Equals(exception.ConstraintName, "ix_users_firebase_uid", StringComparison.OrdinalIgnoreCase)) {
            throw UidConflictException();
        }
    }

    private async Task<LoginResult> IssueSessionTokensAsync(
        User user,
        IReadOnlyList<string> roleNames,
        bool isNewUser,
        DateTimeOffset now,
        CancellationToken cancellationToken,
        Role? assignedRole = null
    ) {
        return await _unitOfWork.ExecuteInTransactionAsync(
            async transactionToken => {
                if (isNewUser) {
                    await _userRepository.AddAsync(user, transactionToken);
                    await _unitOfWork.SaveChangesAsync(transactionToken);

                    if (assignedRole is not null) {
                        user.AssignRole(assignedRole);
                    }
                }

                var accessToken = _accessTokenGenerator.Generate(
                    user.Id,
                    user.Email,
                    user.FullName,
                    roleNames);

                var refreshToken = _refreshTokenGenerator.Generate(now);
                var refreshTokenEntity = RefreshToken.Create(
                    user.Id,
                    refreshToken.Hash,
                    refreshToken.ExpiresAt,
                    now);

                await _refreshTokenRepository.AddAsync(refreshTokenEntity, transactionToken);
                await _unitOfWork.SaveChangesAsync(transactionToken);

                var expiresIn = Math.Max(0, (int)(accessToken.ExpiresAt - now).TotalSeconds);

                return new LoginResult(
                    AccessToken: accessToken.Value,
                    TokenType: "Bearer",
                    ExpiresIn: expiresIn,
                    RefreshToken: refreshToken.Value,
                    RefreshTokenExpiresAt: refreshToken.ExpiresAt,
                    User: new LoginUserResult(
                        user.Id,
                        user.Email,
                        user.Phone,
                        user.GetAvatarUrl(),
                        user.FullName,
                        roleNames,
                        user.Status.ToString()));
            },
            cancellationToken);
    }

    private static AppException UidConflictException() => new(
        AppErrorKind.Conflict,
        AuthErrorCodes.EmailAlreadyExists,
        "This email is already linked to a different Google account.",
        [new AppErrorDetail("idToken", ErrorDetailReasons.AlreadyExists,
            "Email is linked to another Firebase UID.")]);
}
