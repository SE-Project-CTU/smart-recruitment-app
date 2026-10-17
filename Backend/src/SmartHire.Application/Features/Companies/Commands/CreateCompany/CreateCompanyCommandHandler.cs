using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.CreateCompany;

public sealed class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, CompanyResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCompanyCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IMediaFileRepository mediaFileRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _mediaFileRepository = mediaFileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CompanyResult> Handle(CreateCompanyCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length < 2 || request.Name.Trim().Length > 200) {
            throw CompanyExceptions.Validation(
                "Company name must be between 2 and 200 characters.",
                [new AppErrorDetail("name", ValidationReasons.MinLength, "Name must be between 2 and 200 characters.")]);
        }

        if (string.IsNullOrWhiteSpace(request.TaxCode)) {
            throw CompanyExceptions.Validation(
                "Tax code is required.",
                [new AppErrorDetail("taxCode", ValidationReasons.Required, "Tax code cannot be empty.")]);
        }

        if (string.IsNullOrWhiteSpace(request.Email)) {
            throw CompanyExceptions.Validation(
                "Email is required.",
                [new AppErrorDetail("email", ValidationReasons.Required, "Email cannot be empty.")]);
        }

        if (string.IsNullOrWhiteSpace(request.Phone)) {
            throw CompanyExceptions.Validation(
                "Phone is required.",
                [new AppErrorDetail("phone", ValidationReasons.Required, "Phone cannot be empty.")]);
        }

        // Check tax code
        var existingCompany = await _companyRepository.GetByTaxCodeAsync(request.TaxCode.Trim(), cancellationToken);
        if (existingCompany is not null) {
            throw CompanyExceptions.CompanyTaxCodeAlreadyExists();
        }

        string? resolvedLogoUrl = null;
        if (request.LogoFileId is Guid logoFileId) {
            var logoFile = await _mediaFileRepository.GetByIdAsync(logoFileId, cancellationToken);
            if (logoFile is null) {
                throw CompanyExceptions.MediaFileNotFound();
            }

            if (logoFile.OwnerId != userId) {
                throw CompanyExceptions.MediaFileForbidden();
            }

            if (!logoFile.FileType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)) {
                throw CompanyExceptions.MediaFileInvalidImage();
            }

            var isLogoInUse = await _companyRepository.ExistsByLogoFileIdAsync(logoFileId, null, cancellationToken);
            if (isLogoInUse) {
                throw CompanyExceptions.CompanyLogoAlreadyInUse();
            }

            resolvedLogoUrl = logoFile.FileUrl;
        }

        var now = DateTimeOffset.UtcNow;

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            var company = Company.Create(
                name: request.Name,
                taxCode: request.TaxCode,
                email: request.Email,
                phone: request.Phone,
                address: request.Address,
                website: request.Website,
                description: request.Description,
                logoFileId: request.LogoFileId,
                now: now);

            await _companyRepository.AddAsync(company, ct);

            var membership = CompanyMembership.Create(
                companyId: company.Id,
                userId: userId,
                role: CompanyMemberRole.Owner,
                status: CompanyMembershipStatus.Active,
                joinedAt: now,
                now: now);

            await _companyRepository.AddMembershipAsync(membership, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            return CompanyResultMapper.ToCompanyResult(
                company,
                logoUrl: resolvedLogoUrl ?? request.LogoUrl,
                membership: new CompanyMembershipSummary("Owner", "Active"));
        }, cancellationToken);
    }
}
