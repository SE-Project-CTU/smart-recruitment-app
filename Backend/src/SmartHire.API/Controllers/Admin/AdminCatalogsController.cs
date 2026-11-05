using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.CreateIndustry;
using SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.UpdateIndustry;
using SmartHire.Application.Features.Admin.Catalogs.Industries.Queries.ListIndustries;
using SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.CreateIndustryGroup;
using SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.UpdateIndustryGroup;
using SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Queries.ListIndustryGroups;
using SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.CreateProvince;
using SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.UpdateProvince;
using SmartHire.Application.Features.Admin.Catalogs.Provinces.Queries.ListProvinces;
using SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.CreateWard;
using SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.UpdateWard;
using SmartHire.Application.Features.Admin.Catalogs.Wards.Queries.ListWards;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin")]
public sealed class AdminCatalogsController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminCatalogsController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    // ==========================================
    // API 8: Quản lý nhóm ngành (Industry Groups)
    // ==========================================

    [HttpGet("industry-groups")]
    public async Task<IActionResult> GetIndustryGroups(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListIndustryGroupsQuery(
            Search: search,
            IsActive: isActive,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    [HttpPost("industry-groups")]
    public async Task<IActionResult> CreateIndustryGroup(
        [FromBody] CreateIndustryGroupRequest request,
        CancellationToken cancellationToken = default) {
        var command = new CreateIndustryGroupCommand(request.Name);
        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpPatch("industry-groups/{id:guid}")]
    public async Task<IActionResult> UpdateIndustryGroup(
        [FromRoute] Guid id,
        [FromBody] UpdateIndustryGroupRequest request,
        CancellationToken cancellationToken = default) {
        var command = new UpdateIndustryGroupCommand(id, request.Name, request.IsActive);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    // ==========================================
    // API 9: Quản lý ngành nghề (Industries)
    // ==========================================

    [HttpGet("industries")]
    public async Task<IActionResult> GetIndustries(
        [FromQuery] Guid? groupId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListIndustriesQuery(
            GroupId: groupId,
            Search: search,
            IsActive: isActive,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    [HttpPost("industries")]
    public async Task<IActionResult> CreateIndustry(
        [FromBody] CreateIndustryRequest request,
        CancellationToken cancellationToken = default) {
        var command = new CreateIndustryCommand(request.GroupId, request.Name);
        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpPatch("industries/{id:guid}")]
    public async Task<IActionResult> UpdateIndustry(
        [FromRoute] Guid id,
        [FromBody] UpdateIndustryRequest request,
        CancellationToken cancellationToken = default) {
        var command = new UpdateIndustryCommand(id, request.GroupId, request.Name, request.IsActive);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    // ==========================================
    // API 10: Quản lý Tỉnh/Thành phố (Provinces)
    // ==========================================

    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces(
        [FromQuery] string? search,
        [FromQuery] LocationStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListProvincesQuery(
            Search: search,
            Status: status,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    [HttpPost("provinces")]
    public async Task<IActionResult> CreateProvince(
        [FromBody] CreateProvinceRequest request,
        CancellationToken cancellationToken = default) {
        var command = new CreateProvinceCommand(request.Name, request.IsCentrallyGoverned);
        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpPatch("provinces/{id:guid}")]
    public async Task<IActionResult> UpdateProvince(
        [FromRoute] Guid id,
        [FromBody] UpdateProvinceRequest request,
        CancellationToken cancellationToken = default) {
        LocationStatus? status = null;
        if (!string.IsNullOrWhiteSpace(request.Status)) {
            if (!Enum.TryParse<LocationStatus>(request.Status, true, out var parsed)) {
                throw AdminExceptions.Validation("Invalid location status.", [
                    new AppErrorDetail("status", ValidationReasons.NotAllowed, $"Status '{request.Status}' is invalid. Allowed: 'Active', 'Inactive'.")
                ]);
            }
            status = parsed;
        }

        var command = new UpdateProvinceCommand(id, request.Name, request.IsCentrallyGoverned, status);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    // ==========================================
    // API 11: Quản lý Phường/Xã (Wards)
    // ==========================================

    [HttpGet("wards")]
    public async Task<IActionResult> GetWards(
        [FromQuery] Guid? provinceId,
        [FromQuery] string? search,
        [FromQuery] LocationStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListWardsQuery(
            ProvinceId: provinceId,
            Search: search,
            Status: status,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    [HttpPost("wards")]
    public async Task<IActionResult> CreateWard(
        [FromBody] CreateWardRequest request,
        CancellationToken cancellationToken = default) {
        var command = new CreateWardCommand(request.ProvinceId, request.Name, request.IsCommune);
        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpPatch("wards/{id:guid}")]
    public async Task<IActionResult> UpdateWard(
        [FromRoute] Guid id,
        [FromBody] UpdateWardRequest request,
        CancellationToken cancellationToken = default) {
        LocationStatus? status = null;
        if (!string.IsNullOrWhiteSpace(request.Status)) {
            if (!Enum.TryParse<LocationStatus>(request.Status, true, out var parsed)) {
                throw AdminExceptions.Validation("Invalid location status.", [
                    new AppErrorDetail("status", ValidationReasons.NotAllowed, $"Status '{request.Status}' is invalid. Allowed: 'Active', 'Inactive'.")
                ]);
            }
            status = parsed;
        }

        var command = new UpdateWardCommand(id, request.ProvinceId, request.Name, request.IsCommune, status);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

