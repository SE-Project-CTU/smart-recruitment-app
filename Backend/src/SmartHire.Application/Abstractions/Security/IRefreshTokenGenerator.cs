namespace SmartHire.Application.Abstractions.Security;

public sealed record GeneratedRefreshToken(
    string Value,
    string Hash,
    DateTimeOffset ExpiresAt
);

public interface IRefreshTokenGenerator {
    GeneratedRefreshToken Generate(DateTimeOffset now);
    string Hash(string token);
}