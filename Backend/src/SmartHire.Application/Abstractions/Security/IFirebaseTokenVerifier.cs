namespace SmartHire.Application.Abstractions.Security;

public sealed record VerifiedFirebaseUser(
    string Uid,
    string Email,
    bool EmailVerified,
    string? FullName,
    string? AvatarUrl
);

public interface IFirebaseTokenVerifier {
    Task<VerifiedFirebaseUser> VerifyIdTokenAsync(
        string idToken,
        CancellationToken cancellationToken
    );
}

