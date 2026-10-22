using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyFollowers;

public sealed class ListCompanyFollowersQueryHandler : IRequestHandler<ListCompanyFollowersQuery, (CompanyFollowersResponse Response, int TotalCount)> {
    private readonly ICompanyRepository _companyRepository;

    public ListCompanyFollowersQueryHandler(ICompanyRepository companyRepository) {
        _companyRepository = companyRepository;
    }

    public async Task<(CompanyFollowersResponse Response, int TotalCount)> Handle(ListCompanyFollowersQuery request, CancellationToken cancellationToken) {
        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        var totalFollowers = await _companyRepository.CountFollowersAsync(request.CompanyId, cancellationToken);
        var (items, _) = await _companyRepository.GetFollowersPagedAsync(
            request.CompanyId,
            request.Page,
            request.PageSize,
            cancellationToken);

        var followersList = items.Select(CompanyResultMapper.ToCompanyFollowerItem).ToList();
        var response = CompanyResultMapper.ToCompanyFollowersResponse(
            request.CompanyId,
            totalFollowers,
            followersList);

        return (response, totalFollowers);
    }
}
