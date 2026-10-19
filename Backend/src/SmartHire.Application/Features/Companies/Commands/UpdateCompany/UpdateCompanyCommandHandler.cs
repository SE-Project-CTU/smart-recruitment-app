using MediatR;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;
using SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.UpdateCompany;

public sealed class UpdateCompanyCommandHandler : IRequestHandler<UpdateCompanyCommand, CompanyResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IBackgroundJobScheduler _backgroundJobScheduler;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCompanyCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IMediaFileRepository mediaFileRepository,
        IBackgroundJobScheduler backgroundJobScheduler,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _mediaFileRepository = mediaFileRepository;
        _backgroundJobScheduler = backgroundJobScheduler;
        _unitOfWork = unitOfWork;
    }

    public async Task<CompanyResult> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        request = UpdateCompanyCommandValidator.Validate(request);

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Kiểm tra caller phải là Owner
        var membership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (membership is null || membership.Role != CompanyMemberRole.Owner || membership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.NotCompanyOwner();
        }

        string? resolvedLogoUrl = null;
        if (request.LogoFileIdProvided && request.LogoFileId is Guid newLogoId) {
            var logoFile = await _mediaFileRepository.GetByIdAsync(newLogoId, cancellationToken);
            if (logoFile is null) {
                throw CompanyExceptions.MediaFileNotFound();
            }

            if (logoFile.OwnerId != userId) {
                throw CompanyExceptions.MediaFileForbidden();
            }

            if (!logoFile.FileType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)) {
                throw CompanyExceptions.MediaFileInvalidImage();
            }

            if (newLogoId != company.LogoFileId) {
                var isLogoInUse = await _companyRepository.ExistsByLogoFileIdAsync(newLogoId, company.Id, cancellationToken);
                if (isLogoInUse) {
                    throw CompanyExceptions.CompanyLogoAlreadyInUse();
                }
            }

            resolvedLogoUrl = logoFile.FileUrl;
        }

        var oldLogoFileId = company.LogoFileId;
        var targetLogoFileId = request.LogoFileIdProvided ? request.LogoFileId : oldLogoFileId;
        var shouldDeleteOldLogo = request.LogoFileIdProvided && oldLogoFileId.HasValue && oldLogoFileId != targetLogoFileId;

        var now = DateTimeOffset.UtcNow;
        company.UpdateProfile(
            name: request.Name,
            email: request.Email,
            phone: request.Phone,
            address: request.Address,
            website: request.Website,
            description: request.Description,
            logoFileId: targetLogoFileId,
            updateLogo: request.LogoFileIdProvided,
            now: now);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (shouldDeleteOldLogo) {
            _backgroundJobScheduler.Enqueue<DeleteMediaFileJob, DeleteMediaFileJobArgs>(
                new DeleteMediaFileJobArgs(oldLogoFileId!.Value)
            );
        }

        string? logoUrl;
        if (request.LogoFileIdProvided) {
            logoUrl = resolvedLogoUrl;
        } else {
            logoUrl = company.LogoFile?.FileUrl ?? request.LogoUrl;
        }

        return CompanyResultMapper.ToCompanyResult(
            company,
            logoUrl: logoUrl,
            membership: new CompanyMembershipSummary("Owner", "Active"));
    }
}
