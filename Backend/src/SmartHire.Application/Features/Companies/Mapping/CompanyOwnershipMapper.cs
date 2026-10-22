using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyOwnershipMapper {
    public static TransferOwnershipResult ToTransferResult(
        Guid companyId,
        Guid previousOwnerId,
        Guid newOwnerId,
        DateTimeOffset transferredAt) =>
        new(companyId, previousOwnerId, newOwnerId, transferredAt);
}
