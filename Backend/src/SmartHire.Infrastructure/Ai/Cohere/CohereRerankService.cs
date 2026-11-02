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

        // Đồng bộ 100% với RerankJobsAsync: Query là CV ứng viên, Document là chi tiết Job Description
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

    private static string ExtractKeyJobRequirements(string jobText) {
        if (string.IsNullOrWhiteSpace(jobText)) return "Job Requirements";
        // Giới hạn query độ dài tối ưu cho Rerank model (dưới 400 từ)
        var lines = jobText.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var filteredLines = lines.Where(l => !l.StartsWith("Mức lương:", StringComparison.OrdinalIgnoreCase) &&
                                            !l.StartsWith("Salary:", StringComparison.OrdinalIgnoreCase)).Take(10);
        return string.Join("\n", filteredLines);
    }

    private static decimal CalculateHeuristicScore(string cvText, string jobText) {
        if (string.IsNullOrWhiteSpace(cvText) || string.IsNullOrWhiteSpace(jobText)) return 20.00m;

        // Bộ stop words thông dụng tiếng Việt và tiếng Anh để chấm điểm khắt khe, chính xác
        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
            "và", "của", "là", "trong", "với", "cho", "các", "những", "được", "có", "tại", "để", "về", "một", "này", "khi",
            "ở", "từ", "theo", "như", "đã", "sẽ", "đang", "rất", "nhiều", "lại", "ra", "vào", "lên", "xuống",
            "and", "the", "in", "of", "to", "for", "with", "a", "an", "is", "at", "on", "by", "from", "as", "or", "are", "be"
        };

        var delimiters = new[] { ' ', ',', '.', ';', ':', '\n', '\r', '(', ')', '[', ']', '-', '/', '•', '|', '+', '&' };

        var cvTokens = cvText.ToLowerInvariant()
            .Split(delimiters, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 2 && !stopWords.Contains(w))
            .ToHashSet();

        var jobTokens = jobText.ToLowerInvariant()
            .Split(delimiters, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 2 && !stopWords.Contains(w))
            .Distinct()
            .ToList();

        if (jobTokens.Count == 0) return 25.00m;

        var matchedCount = jobTokens.Count(t => cvTokens.Contains(t));
        var matchRatio = (decimal)matchedCount / jobTokens.Count;

        // Nếu khớp rất ít (<20% từ khóa): điểm 15 - 35%
        // Nếu khớp vừa (40 - 60% từ khóa): điểm 45 - 65%
        // Nếu khớp tốt (>75% từ khóa): điểm 75 - 92%
        var calculatedScore = Math.Clamp(matchRatio * 85m + 10m, 15.00m, 95.00m);
        return Math.Round(calculatedScore, 2);
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
