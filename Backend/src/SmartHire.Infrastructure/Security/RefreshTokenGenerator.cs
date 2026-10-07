using System.Security.Cryptography;
using System.Text;
using SmartHire.Application.Abstractions.Security;

namespace SmartHire.Infrastructure.Security;

public class RefreshTokenGenerator : IRefreshTokenGenerator {
    private readonly JwtOptions _jwtOptions;
    
    public RefreshTokenGenerator(JwtOptions jwtOptions) {
        _jwtOptions = jwtOptions;
        
        if (_jwtOptions.RefreshTokenLifetimeDays <= 0) {
            throw new InvalidOperationException(
                "JWT refresh-token lifetime must be greater than zero."
            );
        }
    }
    
    public GeneratedRefreshToken Generate(DateTimeOffset now) {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        var base64 = Convert.ToBase64String(randomBytes);
        var tokenBody = base64
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
        
        var value = $"rt_{tokenBody}";
        
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        var hash = Convert.ToHexString(hashBytes);
        
        var expiresAt = now.AddDays(_jwtOptions.RefreshTokenLifetimeDays);
        
        return new GeneratedRefreshToken(value, hash, expiresAt);
    }
}