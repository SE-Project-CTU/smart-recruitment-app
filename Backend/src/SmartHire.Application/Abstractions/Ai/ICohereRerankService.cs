namespace SmartHire.Application.Abstractions.Ai;

public interface ICohereRerankService {
    Task<decimal> ComputeMatchScoreAsync(string cvText, string jobText, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RerankResultItem>> RerankJobsAsync(string cvText, IReadOnlyList<RerankCandidate> candidates, CancellationToken cancellationToken = default);
}
