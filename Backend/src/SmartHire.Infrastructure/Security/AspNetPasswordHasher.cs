using Microsoft.AspNetCore.Identity;
using SmartHire.Application.Abstractions.Security;

namespace SmartHire.Infrastructure.Security;

public sealed class AspNetPasswordHasher : IPasswordHasher {
    private readonly object _userContext = new();
    private readonly PasswordHasher<object> _hasher = new();
    
    public string Hash(string password) {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        return _hasher.HashPassword(_userContext, password);
    }
    
    public bool Verify(string password, string passwordHash) {
        if (
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(passwordHash)
        ) {
            return false;
        }
        
        var result = _hasher.VerifyHashedPassword(
            _userContext,
            passwordHash,
            password
        );
        
        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}