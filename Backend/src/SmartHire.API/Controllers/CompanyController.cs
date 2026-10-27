using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Companies.Commands.AcceptInvitation;
using SmartHire.Application.Features.Companies.Commands.CreateCompany;
using SmartHire.Application.Features.Companies.Commands.FollowCompany;
using SmartHire.Application.Features.Companies.Commands.InviteRecruiter;
using SmartHire.Application.Features.Companies.Commands.RejectInvitation;
using SmartHire.Application.Features.Companies.Commands.ReviewJoinRequest;
using SmartHire.Application.Features.Companies.Commands.SubmitJoinRequest;
using SmartHire.Application.Features.Companies.Commands.TransferOwnership;
using SmartHire.Application.Features.Companies.Commands.UnfollowCompany;
using SmartHire.Application.Features.Companies.Commands.UpdateCompany;
using SmartHire.Application.Features.Companies.Queries.GetCompanyDetail;
using SmartHire.Application.Features.Companies.Queries.ListCompanies;
using SmartHire.Application.Features.Companies.Queries.ListCompanyFollowers;
using SmartHire.Application.Features.Companies.Queries.ListCompanyMembers;
using SmartHire.Application.Features.Companies.Queries.ListCompanyJobPostings;
using SmartHire.Application.Features.Companies.Queries.ListJoinRequests;
using SmartHire.Application.Features.Companies.Queries.ListMyInvitations;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/companies")]
public sealed class CompanyController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public CompanyController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// Lấy danh sách công ty
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ListCompanies(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        CompanyVerificationStatus? parsedStatus = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<CompanyVerificationStatus>(status, true, out var st)) {
            parsedStatus = st;
        }

        var (items, totalCount) = await _sender.Send(
            new ListCompaniesQuery(search, parsedStatus, page, pageSize),
            cancellationToken);

        return Ok(_responseFactory.Paged(items, page, pageSize, totalCount));
    }
 
    /// Tạo hồ sơ công ty mới
    [HttpPost]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> CreateCompany(
        [FromBody] CreateCompanyRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        var command = new CreateCompanyCommand(
            request.Name,
            request.TaxCode,
            request.Email,
            request.Phone,
            request.Address,
            request.Website,
            request.Description,
            request.LogoFileId,
            request.LogoUrl);

        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// Xem thông tin chi tiết công ty
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyDetail(
        [FromRoute] Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new GetCompanyDetailQuery(id), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
    
    /// Cập nhật thông tin công ty
    [HttpPatch("{id}")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> UpdateCompany(
        [FromRoute] Guid id,
        [FromBody] UpdateCompanyRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        if (request.AdditionalFields is { Count: > 0 }) {
            var details = request.AdditionalFields.Keys
                .Select(fieldName => new AppErrorDetail(
                    fieldName,
                    ValidationReasons.NotAllowed,
                    $"Field '{fieldName}' cannot be updated through this endpoint."))
                .ToArray();

            throw new AppException(
                AppErrorKind.Validation,
                CompanyErrorCodes.InvalidCompanyData,
                "Request body contains disallowed fields.",
                details);
        }

        var command = new UpdateCompanyCommand(
            id,
            request.Name,
            request.Email,
            request.Phone,
            request.Address,
            request.Website,
            request.Description,
            request.LogoFileId,
            request.LogoFileIdProvided,
            request.LogoUrl);

        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// Lấy danh sách thành viên công ty
    [HttpGet("{id}/members")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ListCompanyMembers(
        [FromRoute] Guid id,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var (items, totalCount) = await _sender.Send(
            new ListCompanyMembersQuery(id, page, pageSize, status),
            cancellationToken);

        return Ok(_responseFactory.Paged(items, page, pageSize, totalCount));
    }

/// <summary>
    /// Lấy tất cả tin tuyển dụng của công ty (dành cho Recruiter là thành viên công ty)
    /// </summary>
    [HttpGet("{id}/job-postings")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ListCompanyJobPostings(
        [FromRoute] Guid id,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var (items, totalCount) = await _sender.Send(
            new ListCompanyJobPostingsQuery(id, status, search, page, pageSize),
            cancellationToken);

        return Ok(_responseFactory.Paged(items, page, pageSize, totalCount));
    }

    /// Mời vào công ty
    [HttpPost("{id}/invitations")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> InviteRecruiter(
        [FromRoute] Guid id,
        [FromBody] InviteRecruiterRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        var command = new InviteRecruiterCommand(id, request.Email, request.ExpiresAt);
        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// Danh sách lời mời gia nhập của recruiter hiện tại
    [HttpGet("/api/v1/me/company-invitations")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ListMyInvitations(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var (items, totalCount) = await _sender.Send(
            new ListMyInvitationsQuery(status, page, pageSize),
            cancellationToken);

        return Ok(_responseFactory.Paged(items, page, pageSize, totalCount));
    }

    /// Chấp nhận lời mời gia nhập công ty
    [HttpPost("/api/v1/company-invitations/{invitationId}/accept")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> AcceptInvitation(
        [FromRoute] Guid invitationId,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new AcceptInvitationCommand(invitationId), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// Từ chối lời mời gia nhập công ty
    [HttpPost("/api/v1/company-invitations/{invitationId}/reject")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> RejectInvitation(
        [FromRoute] Guid invitationId,
        CancellationToken cancellationToken) {
        await _sender.Send(new RejectInvitationCommand(invitationId), cancellationToken);
        return NoContent();
    }

    /// Yêu cầu gia nhập công ty
    [HttpPost("{id}/join-requests")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> SubmitJoinRequest(
        [FromRoute] Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new SubmitJoinRequestCommand(id), cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// Danh sách yêu cầu gia nhập
    [HttpGet("{id}/join-requests")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ListJoinRequests(
        [FromRoute] Guid id,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var (items, totalCount) = await _sender.Send(
            new ListJoinRequestsQuery(id, status, page, pageSize),
            cancellationToken);

        return Ok(_responseFactory.Paged(items, page, pageSize, totalCount));
    }

    /// Phê duyệt hoặc từ chối yêu cầu gia nhập
    [HttpPatch("{id}/join-requests/{requestId}")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ReviewJoinRequest(
        [FromRoute] Guid id,
        [FromRoute] Guid requestId,
        [FromBody] ReviewJoinRequestRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        var command = new ReviewJoinRequestCommand(id, requestId, request.Status);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// Chuyển quyền Chủ sở hữu công ty
    [HttpPut("{id}/ownership")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> TransferOwnership(
        [FromRoute] Guid id,
        [FromBody] TransferOwnershipRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        var command = new TransferOwnershipCommand(id, request.NewOwnerId);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// Theo dõi công ty
    [HttpPost("{id}/followers")]
    [Authorize(Roles = RoleNames.Candidate)]
    public async Task<IActionResult> FollowCompany(
        [FromRoute] Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new FollowCompanyCommand(id), cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// Bỏ theo dõi công ty
    [HttpDelete("{id}/followers")]
    [Authorize(Roles = RoleNames.Candidate)]
    public async Task<IActionResult> UnfollowCompany(
        [FromRoute] Guid id,
        CancellationToken cancellationToken) {
        await _sender.Send(new UnfollowCompanyCommand(id), cancellationToken);
        return NoContent();
    }

    /// Danh sách người theo dõi công ty
    [HttpGet("{id}/followers")]
    [Authorize(Roles = RoleNames.Recruiter)]
    public async Task<IActionResult> ListCompanyFollowers(
        [FromRoute] Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var (response, totalCount) = await _sender.Send(
            new ListCompanyFollowersQuery(id, page, pageSize),
            cancellationToken);

        return Ok(_responseFactory.Paged(response.Followers, page, pageSize, totalCount));
    }
}
