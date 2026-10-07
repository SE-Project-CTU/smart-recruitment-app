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
}
