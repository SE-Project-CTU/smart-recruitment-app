using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Common.Validation;
using SmartHire.Domain.Entities;
using SmartHire.Infrastructure.Persistence;

namespace SmartHire.Infrastructure.Seeding;

/// <summary>
/// Creates the configured initial admin account and its role when they do not exist.
/// </summary>
public sealed class AdminAccountSeeder(
    SmartHireDbContext dbContext,
    IPasswordHasher passwordHasher,
    IConfiguration configuration,
    ILogger<AdminAccountSeeder> logger
) {
    private const string EmailVariable = "ADMIN_EMAIL";
    private const string PasswordVariable = "ADMIN_PASSWORD";
    private const string FullNameVariable = "ADMIN_FULL_NAME";

    public async Task SeedAsync(CancellationToken cancellationToken = default) {
        var emailInput = configuration[EmailVariable];
        var passwordInput = configuration[PasswordVariable];
        var fullNameInput = configuration[FullNameVariable];

        if (string.IsNullOrWhiteSpace(emailInput) &&
            string.IsNullOrWhiteSpace(passwordInput) &&
            string.IsNullOrWhiteSpace(fullNameInput)) {
            logger.LogInformation("Admin account seeding skipped because admin environment variables are not configured.");
            return;
        }

        if (string.IsNullOrWhiteSpace(emailInput) ||
            string.IsNullOrWhiteSpace(passwordInput) ||
            string.IsNullOrWhiteSpace(fullNameInput)) {
            throw new InvalidOperationException(
                $"Set all three environment variables: {EmailVariable}, {PasswordVariable}, and {FullNameVariable}.");
        }

        var validationDetails = new List<AppErrorDetail>();
        var email = UserFieldValidator.NormalizeEmail(emailInput, validationDetails);
        var password = UserFieldValidator.ValidatePassword(passwordInput, validationDetails);
        var fullName = UserFieldValidator.ValidateFullName(fullNameInput, validationDetails);

        if (validationDetails.Count > 0) {
            var errors = string.Join(" ", validationDetails.Select(detail => detail.Message));
            throw new InvalidOperationException($"Admin seed configuration is invalid: {errors}");
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var adminRole = await dbContext.Roles
            .SingleOrDefaultAsync(role => role.Name == RoleNames.Admin, cancellationToken);

        if (adminRole is null) {
            adminRole = Role.Create(RoleNames.Admin);
            await dbContext.Roles.AddAsync(adminRole, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var adminUser = await dbContext.Users
            .Include(user => user.UserRoles)
            .SingleOrDefaultAsync(user => user.Email == email, cancellationToken);

        if (adminUser is null) {
            adminUser = User.Create(
                email!,
                null,
                passwordHasher.Hash(password!),
                fullName!,
                DateTimeOffset.UtcNow);

            await dbContext.Users.AddAsync(adminUser, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        adminUser.AssignRole(adminRole);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        logger.LogInformation("Configured admin account is present and assigned the Admin role.");
    }
}
