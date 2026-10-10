using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using SmartHire.Application.Abstractions.Security;

namespace SmartHire.Api.Services;

public class HttpCurrentUser : ICurrentUser {
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public HttpCurrentUser(IHttpContextAccessor httpContextAccessor) {
        _httpContextAccessor = httpContextAccessor;
    }
    
    public Guid? UserId {
        get {
            var subject = _httpContextAccessor.HttpContext?
                .User
                .FindFirstValue("sub");
            
            return Guid.TryParse(subject, out var userId)
                ? userId
                : null;
        }
    }

    public IReadOnlyList<string> Roles {
        get {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null) return [];

            return user.FindAll("role")
                .Concat(user.FindAll(ClaimTypes.Role))
                .Select(c => c.Value)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}