using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.Exceptions;

namespace SmartHire.Application.Features.Companies.Commands.UnfollowCompany;

public sealed class UnfollowCompanyCommandHandler : IRequestHandler<UnfollowCompanyCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UnfollowCompanyCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UnfollowCompanyCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        var follow = await _companyRepository.GetFollowAsync(userId, request.CompanyId, cancellationToken);
        if (follow is null) {
            throw CompanyExceptions.CompanyNotFollowed();
        }

        _companyRepository.DeleteFollow(follow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
