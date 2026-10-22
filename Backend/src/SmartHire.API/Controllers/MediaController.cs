using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Media.Commands.DeleteMediaFile;
using SmartHire.Application.Features.Media.Commands.UploadImage;
using SmartHire.Application.Features.Media.Commands.UploadPdf;
using SmartHire.Application.Features.Media.Exceptions;
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

    // Upload ảnh
    [HttpPost("upload/image")]
    [EnableRateLimiting("media-upload")]
    public async Task<IActionResult> UploadImage(
        IFormFile? file,
        CancellationToken cancellationToken) {
        if (file is null || file.Length == 0) {
            throw MediaExceptions.FileRequired("Image file");
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

    // Upload pdf
    [HttpPost("upload/pdf")]
    [EnableRateLimiting("media-upload")]
    public async Task<IActionResult> UploadPdf(
        IFormFile? file,
        CancellationToken cancellationToken) {
        if (file is null || file.Length == 0) {
            throw MediaExceptions.FileRequired("PDF file");
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

    // Lấy thông tin file media
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMediaFile(
        Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(
            new GetMediaFileQuery(id),
            cancellationToken);

        return Ok(_responseFactory.Success(result));
    }

    // Xóa file media
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMediaFile(
        Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(
            new DeleteMediaFileCommand(id),
            cancellationToken);

        return Ok(_responseFactory.Success(result));
    }
}
