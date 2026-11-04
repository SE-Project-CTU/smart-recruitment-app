using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Ai.Matching.Models;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching;

public interface ISmartHireMatchEngine {
    MatchEngineResult Evaluate(
        CvContentDocument? cv,
        JobPostingDetailData job,
        string? rawCvSkillsText = null,
        decimal? semanticVectorSimilarity = null);

    MatchEngineResult EvaluateFromText(
        string cvText,
        JobPostingDetailData job,
        decimal? semanticVectorSimilarity = null);

    IReadOnlyList<MatchEngineResult> EvaluateBatch(
        CvContentDocument? cv,
        IReadOnlyList<JobPostingDetailData> jobs,
        string? rawCvSkillsText = null,
        IReadOnlyDictionary<Guid, decimal>? semanticVectorSimilarities = null);

    IReadOnlyList<MatchEngineResult> EvaluateBatchFromText(
        string cvText,
        IReadOnlyList<JobPostingDetailData> jobs,
        IReadOnlyDictionary<Guid, decimal>? semanticVectorSimilarities = null);
}
