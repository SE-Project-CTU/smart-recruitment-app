using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Companies.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Companies.Queries.GetAdminCompanyDetail;

public sealed class GetAdminCompanyDetailQueryHandler
    : IRequestHandler<GetAdminCompanyDetailQuery, AdminCompanyDetailDto> {
    private readonly ICompanyRepository _companyRepository;

    public GetAdminCompanyDetailQueryHandler(ICompanyRepository companyRepository) {
        _companyRepository = companyRepository;
    }

    public async Task<AdminCompanyDetailDto> Handle(
        GetAdminCompanyDetailQuery request,
        CancellationToken cancellationToken) {
        var company = await _companyRepository.GetAdminCompanyDetailAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw AdminExceptions.CompanyNotFound(request.CompanyId);
        }

        return company;
    }
}
