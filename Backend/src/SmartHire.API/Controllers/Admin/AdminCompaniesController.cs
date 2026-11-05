using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Companies.Commands.ReviewCompanyVerification;
using SmartHire.Application.Features.Admin.Companies.Queries.GetAdminCompanyDetail;
using SmartHire.Application.Features.Admin.Companies.Queries.ListAdminCompanies;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/companies")]
public sealed class AdminCompaniesController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminCompaniesController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Danh sách doanh nghiệp chờ phê duyệt / bộ lọc
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCompanies(
        [FromQuery] string? search,
        [FromQuery] CompanyVerificationStatus? verificationStatus,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListAdminCompaniesQuery(
            Search: search,
            Status: verificationStatus,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Xem chi tiết giấy tờ và hồ sơ doanh nghiệp
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCompanyDetail(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) {
        var query = new GetAdminCompanyDetailQuery(id);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Phê duyệt hoặc từ chối doanh nghiệp (kèm lý do khi từ chối)
    /// </summary>
    [HttpPatch("{id:guid}/verification")]
    public async Task<IActionResult> ReviewCompanyVerification(
        [FromRoute] Guid id,
        [FromBody] ReviewCompanyVerificationRequest request,
        CancellationToken cancellationToken = default) {
        if (!Enum.TryParse<CompanyVerificationStatus>(request.VerificationStatus, ignoreCase: true, out var parsedStatus)) {
            throw AdminExceptions.Validation("Trạng thái xác minh không hợp lệ.", [
                new AppErrorDetail("verificationStatus", ValidationReasons.InvalidFormat, "VerificationStatus must be VERIFIED or REJECTED.")
            ]);
        }

        var command = new ReviewCompanyVerificationCommand(
            CompanyId: id,
            Status: parsedStatus,
            Reason: request.Reason
        );

        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}
