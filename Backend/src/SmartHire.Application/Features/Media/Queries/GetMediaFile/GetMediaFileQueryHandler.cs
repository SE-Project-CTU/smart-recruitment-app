using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Media.Queries.GetMediaFile;

public sealed class GetMediaFileQueryHandler
    : IRequestHandler<GetMediaFileQuery, MediaFileResult> {
    private readonly IMediaFileRepository _mediaFileRepository;

    public GetMediaFileQueryHandler(IMediaFileRepository mediaFileRepository) {
        _mediaFileRepository = mediaFileRepository;
    }

    public async Task<MediaFileResult> Handle(
        GetMediaFileQuery request,
        CancellationToken cancellationToken) {
        var mediaFile = await _mediaFileRepository.GetByIdAsync(
            request.FileId,
            cancellationToken);

        if (mediaFile is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                MediaErrorCodes.MediaFileNotFound,
                "Media file was not found.");
        }

        return new MediaFileResult(
            mediaFile.Id,
            mediaFile.OwnerId,
            mediaFile.FileName,
            mediaFile.FileUrl,
            mediaFile.FileType,
            mediaFile.FileSize,
            mediaFile.CreatedAt);
    }
}
