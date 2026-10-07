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
}