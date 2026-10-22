using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Application.Features.Media.Exceptions;
using SmartHire.Application.Features.Media.Mapping;

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

        return MediaResultMapper.ToMediaFileResult(mediaFile);
    }
}
