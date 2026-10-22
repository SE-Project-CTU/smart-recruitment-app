using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyDetailMapper {
    public static CompanyResult ToResult(
        Company company,
        string? logoUrl = null,
        CompanyMembershipSummary? membership = null) {
        ArgumentNullException.ThrowIfNull(company);

        return new CompanyResult(
            company.Id,
            company.Name,
            company.TaxCode,
            company.Email,
            company.Phone,
            company.Address,
            company.Website,
            company.Description,
            logoUrl ?? company.LogoFile?.FileUrl,
            company.VerificationStatus.ToString(),
            company.VerifiedAt,
            company.CreatedAt,
            company.UpdatedAt,
            membership);
    }
}
