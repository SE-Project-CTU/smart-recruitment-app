using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Media.Exceptions;

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
            throw MediaExceptions.MediaFileNotFound();
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
