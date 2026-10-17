using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Commands.FollowCompany;

public sealed class FollowCompanyCommandHandler : IRequestHandler<FollowCompanyCommand, FollowCompanyResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public FollowCompanyCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FollowCompanyResult> Handle(FollowCompanyCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyNotFound,
                "Company not found.");
        }

        var existingFollow = await _companyRepository.GetFollowAsync(userId, request.CompanyId, cancellationToken);
        if (existingFollow is not null) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyAlreadyFollowed,
                "You are already following this company.");
        }

        var now = DateTimeOffset.UtcNow;
        var follow = CompanyFollow.Create(userId, request.CompanyId, now);

        await _companyRepository.AddFollowAsync(follow, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FollowCompanyResult(
            request.CompanyId,
            Followed: true,
            CreatedAt: now);
    }
}
