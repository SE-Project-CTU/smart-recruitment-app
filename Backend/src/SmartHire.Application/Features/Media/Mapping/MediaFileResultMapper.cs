using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Mapping;

public static class MediaFileResultMapper {
    public static MediaFileResult ToResult(MediaFile file) {
        ArgumentNullException.ThrowIfNull(file);

        return new MediaFileResult(
            file.Id,
            file.OwnerId,
            file.FileName,
            file.FileUrl,
            file.FileType,
            file.FileSize,
            file.CreatedAt);
    }
}
