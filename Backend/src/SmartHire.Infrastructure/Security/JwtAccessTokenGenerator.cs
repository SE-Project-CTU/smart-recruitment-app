using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SmartHire.Application.Abstractions.Security;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace SmartHire.Infrastructure.Security;

public sealed class JwtAccessTokenGenerator : IAccessTokenGenerator {
    private readonly JwtOptions _jwtOptions;
    
    public JwtAccessTokenGenerator(IOptions<JwtOptions> jwtOptions) {
        _jwtOptions = jwtOptions.Value;
    }
    
    public GeneratedAccessToken Generate(
        Guid userId,
        string email,
        string fullName,
        IReadOnlyCollection<string> roles
    ) {
        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.AddMinutes(_jwtOptions.AccessTokenLifetimeMinutes);
        
        var claims = new List<Claim> {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Name, fullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };
        
        claims.AddRange(
            roles.Distinct(StringComparer.Ordinal)
                .Select(role => new Claim("role", role))
        );
        
        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtOptions.SigningKey)
        );
        
        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256
        );
        
        var jwt = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials
        );
        
        var value = new JwtSecurityTokenHandler().WriteToken(jwt);
        
        return new GeneratedAccessToken(value, expiresAt);
    }
}
