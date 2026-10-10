using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IMediaFileRepository {
    Task<MediaFile?> GetByIdAsync(
        Guid fileId,
        CancellationToken cancellationToken
    );

    Task AddAsync(
        MediaFile mediaFile, 
        CancellationToken cancellationToken
    );

    void Delete(
        MediaFile mediaFile
    );
}
