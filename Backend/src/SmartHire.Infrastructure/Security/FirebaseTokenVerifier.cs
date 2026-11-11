using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Infrastructure.Security;

public sealed class FirebaseTokenVerifier : IFirebaseTokenVerifier {
    private const string FirebaseAppName = "SmartHireFirebaseAuth";

    private readonly IOptions<FirebaseOptions> _options;
    private readonly ILogger<FirebaseTokenVerifier> _logger;
    private readonly Lock _appLock = new();
    private FirebaseAuth? _firebaseAuth;

    public FirebaseTokenVerifier(
        IOptions<FirebaseOptions> options,
        ILogger<FirebaseTokenVerifier> logger
    ) {
        _options = options;
        _logger = logger;
    }

    public async Task<VerifiedFirebaseUser> VerifyIdTokenAsync(
        string idToken,
        CancellationToken cancellationToken
    ) {
        var auth = GetOrCreateFirebaseAuth();

        FirebaseToken decodedToken;
        try {
            decodedToken = await auth.VerifyIdTokenAsync(idToken, checkRevoked: true, cancellationToken);
        }
        catch (FirebaseAuthException ex) {
            _logger.LogWarning(ex, "Firebase ID token verification failed ({ErrorCode}).", ex.AuthErrorCode);
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidGoogleToken,
                "Google authentication token is invalid or expired.",
                [new AppErrorDetail("idToken", ErrorDetailReasons.InvalidCredentials,
                    "Google authentication token is invalid or expired.")]);
        }

        var email = GetStringClaim(decodedToken.Claims, "email") ?? string.Empty;
        var emailVerified = GetBoolClaim(decodedToken.Claims, "email_verified");
        var fullName = GetStringClaim(decodedToken.Claims, "name");
        var avatarUrl = GetStringClaim(decodedToken.Claims, "picture");

        return new VerifiedFirebaseUser(
            Uid: decodedToken.Uid,
            Email: email,
            EmailVerified: emailVerified,
            FullName: fullName,
            AvatarUrl: avatarUrl);
    }

    private FirebaseAuth GetOrCreateFirebaseAuth() {
        if (_firebaseAuth is not null) {
            return _firebaseAuth;
        }

        lock (_appLock) {
            if (_firebaseAuth is not null) {
                return _firebaseAuth;
            }

            var existingApp = FirebaseApp.GetInstance(FirebaseAppName);
            if (existingApp is not null) {
                _firebaseAuth = FirebaseAuth.GetAuth(existingApp);
                return _firebaseAuth;
            }

            var options = _options.Value;
            if (!options.IsConfigured()) {
                _logger.LogError("Firebase Admin SDK credentials are missing in configuration.");
                throw new InvalidOperationException("Google authentication is not configured on the server.");
            }

            var serviceAccountCredential = CredentialFactory
                .FromJson<ServiceAccountCredential>(options.ToServiceAccountJson());
            var credential = serviceAccountCredential.ToGoogleCredential();
            var app = FirebaseApp.Create(
                new AppOptions {
                    Credential = credential,
                    ProjectId = options.ProjectId.Trim()
                },
                FirebaseAppName);

            _firebaseAuth = FirebaseAuth.GetAuth(app);
            return _firebaseAuth;
        }
    }

    private static string? GetStringClaim(IReadOnlyDictionary<string, object> claims, string key) {
        if (!claims.TryGetValue(key, out var rawValue) || rawValue is null) {
            return null;
        }

        return rawValue.ToString();
    }

    private static bool GetBoolClaim(IReadOnlyDictionary<string, object> claims, string key) {
        if (!claims.TryGetValue(key, out var rawValue) || rawValue is null) {
            return false;
        }

        if (rawValue is bool booleanValue) {
            return booleanValue;
        }

        return bool.TryParse(rawValue.ToString(), out var parsed) && parsed;
    }
}
