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

        request = CreateCompanyCommandValidator.Validate(request);

        // Check tax code
        var existingCompany = await _companyRepository.GetByTaxCodeAsync(request.TaxCode, cancellationToken);
        if (existingCompany is not null) {
            throw CompanyExceptions.CompanyTaxCodeAlreadyExists();
        }

        // Giới hạn số lượng công ty một Recruiter được phép tạo <=5
        const int maxOwnedCompanies = 5;
        var ownedCompanyCount = await _companyRepository.CountOwnedCompaniesAsync(userId, cancellationToken);
        if (ownedCompanyCount >= maxOwnedCompanies) {
            throw CompanyExceptions.MaxOwnedCompaniesReached(maxOwnedCompanies);
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

        return await _unitOfWork.ExecuteInTransactionAsync(async cancellationToken => {
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

            await _companyRepository.AddAsync(company, cancellationToken);

            var membership = CompanyMembership.Create(
                companyId: company.Id,
                userId: userId,
                role: CompanyMemberRole.Owner,
                status: CompanyMembershipStatus.Active,
                joinedAt: now,
                now: now);

            await _companyRepository.AddMembershipAsync(membership, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return CompanyResultMapper.ToCompanyResult(
                company,
                logoUrl: resolvedLogoUrl ?? request.LogoUrl,
                membership: new CompanyMembershipSummary("Owner", "Active"));
        }, cancellationToken);
    }
}
