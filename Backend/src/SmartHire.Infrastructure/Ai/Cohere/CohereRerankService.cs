using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Infrastructure.Ai;

public sealed class CohereRerankService : ICohereRerankService {
    private readonly HttpClient _httpClient;
    private readonly CohereOptions _options;
    private readonly ILogger<CohereRerankService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public CohereRerankService(
        HttpClient httpClient,
        IOptions<CohereOptions> options,
        ILogger<CohereRerankService> logger) {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<decimal> ComputeMatchScoreAsync(string cvText, string jobText, CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(_options.ApiKey)) {
            _logger.LogWarning("Cohere API Key is not configured. Calculating fallback heuristic score.");
            return CalculateHeuristicScore(cvText, jobText);
        }

        var candidates = new List<RerankCandidate> {
            new(Guid.Empty, jobText)
        };

        var results = await RerankJobsAsync(cvText, candidates, cancellationToken);
        if (results.Count > 0) {
            return results[0].Score;
        }

        return CalculateHeuristicScore(cvText, jobText);
    }

    public async Task<IReadOnlyList<RerankResultItem>> RerankJobsAsync(
        string cvText,
        IReadOnlyList<RerankCandidate> candidates,
        CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(cvText)) {
            cvText = "Hồ sơ ứng viên";
        }

        var docs = candidates.Select(c => string.IsNullOrWhiteSpace(c.Text) ? "Thông tin vị trí tuyển dụng" : c.Text).ToList();

        if (string.IsNullOrWhiteSpace(_options.ApiKey)) {
            _logger.LogWarning("Cohere API Key is not configured. Returning fallback ranked candidates.");
            return candidates.Select((c, i) => new RerankResultItem(
                c.Id,
                CalculateHeuristicScore(cvText, c.Text),
                i
            )).OrderByDescending(r => r.Score).ToList();
        }

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

        try {
            var url = "https://api.cohere.com/v2/rerank";

            var payload = new {
                model = _options.Model,
                query = cvText,
                documents = docs,
                top_n = candidates.Count
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, url) {
                Content = JsonContent.Create(payload, options: JsonOptions)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

            var response = await _httpClient.SendAsync(request, cts.Token);
            if (!response.IsSuccessStatusCode) {
                var err = await response.Content.ReadAsStringAsync(cts.Token);
                _logger.LogWarning("Cohere Rerank API returned ({Status}): {Error}. Falling back to heuristic scoring.", response.StatusCode, err);
                return candidates.Select((c, i) => new RerankResultItem(
                    c.Id,
                    CalculateHeuristicScore(cvText, c.Text),
                    i
                )).OrderByDescending(r => r.Score).ToList();
            }

            var result = await response.Content.ReadFromJsonAsync<CohereRerankResponse>(JsonOptions, cts.Token);
            if (result?.Results == null) {
                return Array.Empty<RerankResultItem>();
            }

            return result.Results.Select(r => {
                var score = Math.Round((decimal)r.RelevanceScore * 100m, 2);
                var candidateId = r.Index >= 0 && r.Index < candidates.Count ? candidates[r.Index].Id : Guid.Empty;
                return new RerankResultItem(candidateId, score, r.Index);
            }).ToList();
        } catch (OperationCanceledException) {
            _logger.LogWarning("Cohere Rerank API call timed out after {Seconds}s", _options.TimeoutSeconds);
            throw new AppException(
                AppErrorKind.BadRequest,
                AiErrorCodes.AiServiceUnavailable,
                "Dịch vụ AI đang bận, vui lòng thử lại sau.");
        } catch (HttpRequestException ex) {
            _logger.LogError(ex, "Cohere network exception");
            throw new AppException(
                AppErrorKind.BadRequest,
                AiErrorCodes.AiServiceUnavailable,
                "Dịch vụ AI đang bận, vui lòng thử lại sau.");
        }
    }

    private static decimal CalculateHeuristicScore(string cvText, string jobText) {
        if (string.IsNullOrWhiteSpace(cvText) || string.IsNullOrWhiteSpace(jobText)) return 50.00m;

        var cvWords = cvText.ToLowerInvariant().Split(new[] { ' ', ',', '.', ';', ':', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        var jobWords = jobText.ToLowerInvariant().Split(new[] { ' ', ',', '.', ';', ':', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).ToHashSet();

        if (jobWords.Count == 0) return 60.00m;

        var intersectCount = cvWords.Intersect(jobWords).Count();
        var ratio = (decimal)intersectCount / Math.Max(20, jobWords.Count);
        var score = Math.Clamp(ratio * 100m + 40m, 50.00m, 95.00m);
        return Math.Round(score, 2);
    }

    private sealed class CohereRerankResponse {
        public List<CohereRerankResultItem>? Results { get; set; }
    }

    private sealed class CohereRerankResultItem {
        public int Index { get; set; }
        [JsonPropertyName("relevance_score")]
        public double RelevanceScore { get; set; }
    }
}
