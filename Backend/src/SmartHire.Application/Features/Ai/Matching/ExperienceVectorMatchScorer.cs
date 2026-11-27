using System.Text.RegularExpressions;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Ai.Matching.Models;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Ai.Matching;

public interface IExperienceVectorMatchScorer {
    Task<decimal> ScoreAsync(CvContentDocument? cv, JobPostingDetailData job, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<Guid, decimal>> ScoreBatchAsync(CvContentDocument? cv, IReadOnlyList<JobPostingDetailData> jobs, CancellationToken cancellationToken = default);
}

public sealed class ExperienceVectorMatchScorer(IGeminiAiService geminiAiService) : IExperienceVectorMatchScorer {
    private const int MaxConcurrentJobEmbeddings = 3;

    public async Task<decimal> ScoreAsync(CvContentDocument? cv, JobPostingDetailData job, CancellationToken cancellationToken = default) {
        var experienceText = ExtractCvExperienceText(cv);
        var jobExperienceText = BuildJobExperienceText(job);
        if (string.IsNullOrWhiteSpace(experienceText) || string.IsNullOrWhiteSpace(jobExperienceText)) return 0m;

        var cvVector = await geminiAiService.GenerateEmbeddingAsync(experienceText, cancellationToken);
        var jobVector = await geminiAiService.GenerateEmbeddingAsync(jobExperienceText, cancellationToken);
        return ToScore(CosineSimilarity(cvVector, jobVector));
    }

    public async Task<IReadOnlyDictionary<Guid, decimal>> ScoreBatchAsync(
        CvContentDocument? cv,
        IReadOnlyList<JobPostingDetailData> jobs,
        CancellationToken cancellationToken = default) {
        var experienceText = ExtractCvExperienceText(cv);
        if (string.IsNullOrWhiteSpace(experienceText) || jobs.Count == 0) {
            return jobs.ToDictionary(job => job.Id, _ => 0m);
        }

        var cvVector = await geminiAiService.GenerateEmbeddingAsync(experienceText, cancellationToken);
        var results = new System.Collections.Concurrent.ConcurrentDictionary<Guid, decimal>();
        using var semaphore = new SemaphoreSlim(MaxConcurrentJobEmbeddings);

        await Task.WhenAll(jobs.Select(async job => {
            await semaphore.WaitAsync(cancellationToken);
            try {
                var jobText = BuildJobExperienceText(job);
                var jobVector = string.IsNullOrWhiteSpace(jobText)
                    ? Array.Empty<float>()
                    : await geminiAiService.GenerateEmbeddingAsync(jobText, cancellationToken);
                results[job.Id] = ToScore(CosineSimilarity(cvVector, jobVector));
            } finally {
                semaphore.Release();
            }
        }));

        return results;
    }

    public static string ExtractCvExperienceText(CvContentDocument? cv) {
        if (cv?.Sections.Experience?.Items == null) return string.Empty;

        return string.Join("\n", cv.Sections.Experience.Items
            .Select(item => string.Join(" ", new[] {
                CvTiptapDocument.ExtractPlainText(item.Position),
                CvTiptapDocument.ExtractPlainText(item.Description)
            }.Where(value => !string.IsNullOrWhiteSpace(value))))
            .Where(value => !string.IsNullOrWhiteSpace(value)));
    }

    private static string BuildJobExperienceText(JobPostingDetailData job) {
        var description = RemoveExperienceDurationStatements(job.Description ?? string.Empty);
        var requirements = RemoveExperienceDurationStatements(job.Requirements ?? string.Empty);
        return string.Join("\n", new[] { description, requirements }
            .Where(value => !string.IsNullOrWhiteSpace(value)));
    }

    private static string RemoveExperienceDurationStatements(string text) => Regex.Replace(
        text,
        @"(?i)\b\d+\s*(?:\+|[-–]\s*\d+)?\s*(?:năm|years?)\s*(?:kinh nghiệm|experience)\b|\b(?:kinh nghiệm|experience)\s*(?:từ|of)?\s*\d+\s*(?:năm|years?)\b",
        " ");

    private static decimal? CosineSimilarity(IReadOnlyList<float> left, IReadOnlyList<float> right) {
        if (left.Count == 0 || left.Count != right.Count) return null;

        double dot = 0, leftNorm = 0, rightNorm = 0;
        for (var i = 0; i < left.Count; i++) {
            dot += left[i] * right[i];
            leftNorm += left[i] * left[i];
            rightNorm += right[i] * right[i];
        }

        var denominator = Math.Sqrt(leftNorm) * Math.Sqrt(rightNorm);
        if (denominator <= 0) return null;
        return (decimal)Math.Clamp(dot / denominator, 0d, 1d);
    }

    // MVP mapping: cosine similarity is shown on a 0-100 scale; it is not a probability.
    // Calibrate this mapping against labeled CV/JD examples before treating it as a hiring threshold.
    private static decimal ToScore(decimal? similarity) => similarity.HasValue
        ? Math.Round(Math.Clamp(similarity.Value * 100m, 0m, 100m), 2)
        : 0m;
}
