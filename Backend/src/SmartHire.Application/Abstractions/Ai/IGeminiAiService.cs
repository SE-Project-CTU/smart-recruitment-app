namespace SmartHire.Application.Abstractions.Ai;

public interface IGeminiAiService {
    Task<CvEnhanceResult> EnhanceCvAsync(CvEnhanceRequest request, CancellationToken cancellationToken = default);
    Task<CvBatchEnhanceResult> EnhanceCvBatchAsync(CvBatchEnhanceRequest request, CancellationToken cancellationToken = default);
    IAsyncEnumerable<string> StreamEnhanceCvAsync(CvEnhanceRequest request, CancellationToken cancellationToken = default);
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default);
    Task<MatchAnalysisResult> GenerateAnalysisExplanationAsync(string cvText, string jobText, decimal score, CancellationToken cancellationToken = default);
}
