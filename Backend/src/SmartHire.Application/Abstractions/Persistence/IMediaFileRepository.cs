using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IMediaFileRepository {
    Task<MediaFile?> GetByIdAsync(
        Guid fileId,
        CancellationToken cancellationToken
    );
}