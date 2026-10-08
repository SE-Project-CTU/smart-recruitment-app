using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Auth.RegisterAccount;

public sealed class RegisterAccountWorkflow(
    IUnitOfWork unitOfWork,
    IUserRepository users,
    IRoleRepository roles,
    IPasswordHasher passwordHasher
) {
    public async Task<RegisterAccountResult> RegisterAsync(
        string? email,
        string? phone,
        string? password,
        string? fullName,
        string roleName,
        CancellationToken cancellationToken
    ) {
        var input = RegisterAccountValidator.ValidateAndNormalize(
            email, phone, password, fullName);
        
        if (await users.EmailExistsAsync(input.Email, cancellationToken)) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.EmailAlreadyExists,
                "Email already exists.");
        }
        
        if (input.Phone is not null &&
            await users.PhoneExistsAsync(input.Phone, cancellationToken)) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.PhoneAlreadyExists,
                "Phone number already exists.");
        }
        
        var role = await roles.GetByNameAsync(roleName, cancellationToken);
        if (role is null) {
            var roleErrorCode = roleName switch {
                RoleNames.Candidate => AuthErrorCodes.CandidateRoleNotFound,
                RoleNames.Recruiter => AuthErrorCodes.RecruiterRoleNotFound,
                _ => CommonErrorCodes.InternalServerError
            };
            
            if (roleErrorCode == CommonErrorCodes.InternalServerError) {
                throw new InvalidOperationException($"Required role '{roleName}' was not found.");
            }
            
            throw new AppException(
                AppErrorKind.NotFound,
                roleErrorCode,
                $"Required role '{roleName}' was not found.");
        }
        
        var user = User.Create(
            input.Email,
            input.Phone,
            passwordHasher.Hash(input.Password),
            input.FullName,
            DateTimeOffset.UtcNow);
        
        try {
            return await unitOfWork.ExecuteInTransactionAsync(
                async transactionToken => {
                    await users.AddAsync(user, transactionToken);
                    await users.SaveChangeAsync(transactionToken);
                    
                    user.AssignRole(role);
                    await users.SaveChangeAsync(transactionToken);
                    
                    return new RegisterAccountResult(
                        user.Id,
                        user.Email,
                        user.Phone,
                        user.FullName,
                        new[] { role.Name },
                        user.Status.ToString(),
                        user.CreatedAt);
                },
                cancellationToken);
        }
        catch (Exception ex) when (TryGetPostgresUniqueViolation(ex, out var constraintName)) {
            if (string.Equals(constraintName, "ix_users_email", StringComparison.OrdinalIgnoreCase)) {
                throw new AppException(
                    AppErrorKind.Conflict,
                    AuthErrorCodes.EmailAlreadyExists,
                    "Email already exists.");
            }
            
            if (string.Equals(constraintName, "ix_users_phone", StringComparison.OrdinalIgnoreCase)) {
                throw new AppException(
                    AppErrorKind.Conflict,
                    AuthErrorCodes.PhoneAlreadyExists,
                    "Phone number already exists.");
            }
            
            // Nếu là unique constraint khác không dự đoán được, throw lại lỗi gốc
            throw;
        }
    }
    
    private static bool TryGetPostgresUniqueViolation(Exception exception, out string? constraintName) {
        constraintName = null;
        
        // Duyệt qua chuỗi inner exceptions
        for (var current = exception; current is not null; current = current.InnerException) {
            // Kiểm tra xem exception có thuộc tính SqlState / ConstraintName của Npgsql.PostgresException không
            var type = current.GetType();
            if (type.Name == "PostgresException") {
                var sqlStateProp = type.GetProperty("SqlState");
                var constraintNameProp = type.GetProperty("ConstraintName");
                var sqlState = sqlStateProp?.GetValue(current) as string;
                if (sqlState == "23505") {
                    // Mã lỗi unique_violation trong PostgreSQL
                    constraintName = constraintNameProp?.GetValue(current) as string;
                    return true;
                }
            }
        }
        
        return false;
    }
}