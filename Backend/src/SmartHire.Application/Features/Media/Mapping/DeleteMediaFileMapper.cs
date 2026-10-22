using SmartHire.Application.Features.Media.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Media.Mapping;

public static class DeleteMediaFileMapper {
    public static DeleteMediaFileResult ToResult(Guid fileId, bool deleted = true) =>
        new(fileId, deleted);

    public static DeleteMediaFileResult ToResult(MediaFile file, bool deleted = true) {
        ArgumentNullException.ThrowIfNull(file);
        return new DeleteMediaFileResult(file.Id, deleted);
    }
}
