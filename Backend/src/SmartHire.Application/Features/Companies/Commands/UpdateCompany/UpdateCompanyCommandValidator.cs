using System.ComponentModel.DataAnnotations;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Companies.Exceptions;

namespace SmartHire.Application.Features.Companies.Commands.UpdateCompany;

public static class UpdateCompanyCommandValidator {
    public const int NameMinLength = 2;
    public const int NameMaxLength = 200;
    public const int EmailMaxLength = 254;
    public const int PhoneMinLength = 7;
    public const int PhoneMaxLength = 30;
    public const int AddressMinLength = 5;
    public const int AddressMaxLength = 500;
    public const int WebsiteMaxLength = 500;
    public const int DescriptionMaxLength = 5000;

    public static UpdateCompanyCommand Validate(UpdateCompanyCommand command) {
        var details = new List<AppErrorDetail>();

        if (command.CompanyId == Guid.Empty) {
            details.Add(new AppErrorDetail("companyId", ValidationReasons.InvalidFormat, "Company id must be a valid UUID."));
        }

        if (command.Name is null &&
            command.Email is null &&
            command.Phone is null &&
            command.Address is null &&
            command.Website is null &&
            command.Description is null &&
            !command.LogoFileIdProvided &&
            command.LogoUrl is null) {
            details.Add(new AppErrorDetail("body", ValidationReasons.Required, "At least one field must be provided for update."));
        }

        var name = command.Name?.Trim();
        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(name)) {
                details.Add(new AppErrorDetail("name", ValidationReasons.Required, "Company name cannot be empty."));
            } else if (name.Length < NameMinLength) {
                details.Add(new AppErrorDetail("name", ValidationReasons.MinLength, $"Company name must be at least {NameMinLength} characters."));
            } else if (name.Length > NameMaxLength) {
                details.Add(new AppErrorDetail("name", ValidationReasons.MaxLength, $"Company name must not exceed {NameMaxLength} characters."));
            }
        }

        var email = command.Email?.Trim();
        if (command.Email is not null) {
            if (string.IsNullOrWhiteSpace(email)) {
                details.Add(new AppErrorDetail("email", ValidationReasons.Required, "Email cannot be empty."));
            } else {
                if (email.Length > EmailMaxLength) {
                    details.Add(new AppErrorDetail("email", ValidationReasons.MaxLength, $"Email must not exceed {EmailMaxLength} characters."));
                }
                if (!new EmailAddressAttribute().IsValid(email)) {
                    details.Add(new AppErrorDetail("email", ValidationReasons.InvalidFormat, "Email format is invalid."));
                }
            }
        }

        var phone = command.Phone?.Trim();
        if (command.Phone is not null) {
            if (string.IsNullOrWhiteSpace(phone)) {
                details.Add(new AppErrorDetail("phone", ValidationReasons.Required, "Phone cannot be empty."));
            } else if (phone.Length < PhoneMinLength || phone.Length > PhoneMaxLength) {
                details.Add(new AppErrorDetail("phone", ValidationReasons.InvalidFormat, $"Phone must be between {PhoneMinLength} and {PhoneMaxLength} characters."));
            }
        }

        var address = command.Address?.Trim();
        if (command.Address is not null) {
            if (!string.IsNullOrWhiteSpace(address)) {
                if (address.Length < AddressMinLength) {
                    details.Add(new AppErrorDetail("address", ValidationReasons.MinLength, $"Address must be at least {AddressMinLength} characters."));
                } else if (address.Length > AddressMaxLength) {
                    details.Add(new AppErrorDetail("address", ValidationReasons.MaxLength, $"Address must not exceed {AddressMaxLength} characters."));
                }
            } else {
                address = null;
            }
        }

        var website = command.Website?.Trim();
        if (command.Website is not null) {
            if (!string.IsNullOrWhiteSpace(website)) {
                if (website.Length > WebsiteMaxLength) {
                    details.Add(new AppErrorDetail("website", ValidationReasons.MaxLength, $"Website must not exceed {WebsiteMaxLength} characters."));
                }
                if (!Uri.TryCreate(website, UriKind.Absolute, out _)) {
                    details.Add(new AppErrorDetail("website", ValidationReasons.InvalidFormat, "Website must be a valid absolute URL."));
                }
            } else {
                website = null;
            }
        }

        var description = command.Description?.Trim();
        if (command.Description is not null) {
            if (!string.IsNullOrWhiteSpace(description)) {
                if (description.Length > DescriptionMaxLength) {
                    details.Add(new AppErrorDetail("description", ValidationReasons.MaxLength, $"Description must not exceed {DescriptionMaxLength} characters."));
                }
            } else {
                description = null;
            }
        }

        var logoUrl = command.LogoUrl?.Trim();
        if (command.LogoUrl is not null) {
            if (!string.IsNullOrWhiteSpace(logoUrl)) {
                if (!Uri.TryCreate(logoUrl, UriKind.Absolute, out _)) {
                    details.Add(new AppErrorDetail("logoUrl", ValidationReasons.InvalidFormat, "Logo URL must be a valid absolute URL."));
                }
            } else {
                logoUrl = null;
            }
        }

        if (details.Count > 0) {
            throw CompanyExceptions.Validation("Request contains invalid fields.", details);
        }

        return command with {
            Name = name,
            Email = email,
            Phone = phone,
            Address = address,
            Website = website,
            Description = description,
            LogoUrl = logoUrl
        };
    }
}
