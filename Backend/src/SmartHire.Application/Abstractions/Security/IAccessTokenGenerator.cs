namespace SmartHire.Application.Abstractions.Security;

public sealed record GeneratedAccessToken(
    string Value,
    DateTimeOffset ExpiresAt
);

public interface IAccessTokenGenerator {
    GeneratedAccessToken Generate(
        Guid userId,
        string email,
        string fullName,
        IReadOnlyCollection<string> roles
    );
}