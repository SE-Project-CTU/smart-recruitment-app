using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using SmartHire.Application.Abstractions.Security;

namespace SmartHire.Infrastructure.Security;

public class RefreshTokenGenerator : IRefreshTokenGenerator {
    private readonly JwtOptions _jwtOptions;
    
    public RefreshTokenGenerator(IOptions<JwtOptions> jwtOptions) {
        _jwtOptions = jwtOptions.Value;
    }
    
    public GeneratedRefreshToken Generate(DateTimeOffset now) {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        var base64 = Convert.ToBase64String(randomBytes);
        var tokenBody = base64
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
        
        var value = $"rt_{tokenBody}";
        
        var expiresAt = now.AddDays(_jwtOptions.RefreshTokenLifetimeDays);
        
        return new GeneratedRefreshToken(value, Hash(value), expiresAt);
    }
    
    public string Hash(string token) {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes);
    }
}
