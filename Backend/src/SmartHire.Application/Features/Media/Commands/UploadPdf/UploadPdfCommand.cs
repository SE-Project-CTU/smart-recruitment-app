using MediatR;
using SmartHire.Application.Features.Media;

namespace SmartHire.Application.Features.Media.Commands.UploadPdf;

public sealed record UploadPdfCommand(
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSize
) : IRequest<MediaFileResult>;
