using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobApplicationRepository {
    Task<bool> ExistsForCandidateAsync(Guid jobId, Guid candidateId, CancellationToken cancellationToken);
    Task<bool> IsUploadedCvFileInUseAsync(Guid fileId, CancellationToken cancellationToken);
    Task AddAsync(JobApplication application, CancellationToken cancellationToken);
}
