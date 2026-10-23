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
                "Email already exists.",
                [new AppErrorDetail("email", ErrorDetailReasons.AlreadyExists,
                    "This email address is already associated with an account.")]);
        }
        
        if (input.Phone is not null &&
            await users.PhoneExistsAsync(input.Phone, cancellationToken)) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.PhoneAlreadyExists,
                "Phone number already exists.",
                [new AppErrorDetail("phone", ErrorDetailReasons.AlreadyExists,
                    "This phone number is already associated with an account.")]);
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
                $"Required role '{roleName}' was not found.",
                [new AppErrorDetail("role", ErrorDetailReasons.NotFound,
                    $"The required role '{roleName}' is not configured.")]);
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
                    await unitOfWork.SaveChangesAsync(transactionToken);
                    
                    user.AssignRole(role);
                    await unitOfWork.SaveChangesAsync(transactionToken);
                    
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
        catch (PersistenceUniqueConstraintViolationException exception) {
            if (string.Equals(exception.ConstraintName, "ix_users_email", StringComparison.OrdinalIgnoreCase)) {
                throw new AppException(
                    AppErrorKind.Conflict,
                    AuthErrorCodes.EmailAlreadyExists,
                    "Email already exists.",
                    [new AppErrorDetail("email", ErrorDetailReasons.AlreadyExists,
                        "This email address is already associated with an account.")]);
            }
            
            if (string.Equals(exception.ConstraintName, "ix_users_phone", StringComparison.OrdinalIgnoreCase)) {
                throw new AppException(
                    AppErrorKind.Conflict,
                    AuthErrorCodes.PhoneAlreadyExists,
                    "Phone number already exists.",
                    [new AppErrorDetail("phone", ErrorDetailReasons.AlreadyExists,
                        "This phone number is already associated with an account.")]);
            }
            
            // Nếu là unique constraint khác không dự đoán được, throw lại lỗi gốc
            throw;
        }
    }
    
}
