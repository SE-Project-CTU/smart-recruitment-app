using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Mapping;

public static class MediaResultMapper {
    public static MediaFileResult ToMediaFileResult(MediaFile file) =>
        MediaFileResultMapper.ToResult(file);

    public static DeleteMediaFileResult ToDeleteMediaFileResult(Guid fileId, bool deleted = true) =>
        DeleteMediaFileMapper.ToResult(fileId, deleted);

    public static DeleteMediaFileResult ToDeleteMediaFileResult(MediaFile file, bool deleted = true) =>
        DeleteMediaFileMapper.ToResult(file, deleted);
}
