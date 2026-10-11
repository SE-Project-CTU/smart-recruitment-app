using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Media.Commands.DeleteMediaFile;
using SmartHire.Application.Features.Media.Commands.UploadImage;
using SmartHire.Application.Features.Media.Commands.UploadPdf;
using SmartHire.Application.Features.Media.Queries.GetMediaFile;

namespace SmartHire.Api.Controllers;

[ApiController]
[Authorize(Roles =
    RoleNames.Candidate + "," +
    RoleNames.Recruiter + "," +
    RoleNames.Admin)
]
[Route("api/v1/media")]
public sealed class MediaController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public MediaController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    [HttpPost("upload/image")]
    public async Task<IActionResult> UploadImage(
        IFormFile? file,
        CancellationToken cancellationToken) {
        if (file is null || file.Length == 0) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "Image file is required.",
                [new AppErrorDetail("file", ValidationReasons.Required, "A file must be provided.")]);
        }

        await using var stream = file.OpenReadStream();

        var result = await _sender.Send(
            new UploadImageCommand(
                FileStream: stream,
                FileName: file.FileName,
                ContentType: file.ContentType,
                FileSize: file.Length),
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpPost("upload/pdf")]
    public async Task<IActionResult> UploadPdf(
        IFormFile? file,
        CancellationToken cancellationToken) {
        if (file is null || file.Length == 0) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "PDF file is required.",
                [new AppErrorDetail("file", ValidationReasons.Required, "A file must be provided.")]);
        }

        await using var stream = file.OpenReadStream();

        var result = await _sender.Send(
            new UploadPdfCommand(
                FileStream: stream,
                FileName: file.FileName,
                ContentType: file.ContentType,
                FileSize: file.Length),
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMediaFile(
        Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(
            new GetMediaFileQuery(id),
            cancellationToken);

        return Ok(_responseFactory.Success(result));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMediaFile(
        Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(
            new DeleteMediaFileCommand(id),
            cancellationToken);

        return Ok(_responseFactory.Success(result));
    }
}
