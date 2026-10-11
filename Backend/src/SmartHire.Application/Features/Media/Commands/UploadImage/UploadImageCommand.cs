using MediatR;
using SmartHire.Application.Features.Media;

namespace SmartHire.Application.Features.Media.Commands.UploadImage;

public sealed record UploadImageCommand(
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSize
) : IRequest<MediaFileResult>;
