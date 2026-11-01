using System.Net;
using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Infrastructure.Ai;

public sealed class GeminiAiService : IGeminiAiService {
    private readonly HttpClient _httpClient;
    private readonly GeminiOptions _options;
    private readonly ILogger<GeminiAiService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private const string DefaultActiveFallbackModel = "gemini-flash-lite-latest";

    public GeminiAiService(
        HttpClient httpClient,
        IOptions<GeminiOptions> options,
        ILogger<GeminiAiService> logger) {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    private static string NormalizeModelName(string? model) {
        if (string.IsNullOrWhiteSpace(model)) return "gemini-3.5-flash-lite";
        return model.Trim();
    }

    private static bool IsQuotaExceeded(HttpStatusCode statusCode, string? responseBody) {
        if (statusCode == HttpStatusCode.TooManyRequests) return true;
        if (string.IsNullOrWhiteSpace(responseBody)) return false;
        return responseBody.Contains("RESOURCE_EXHAUSTED", StringComparison.OrdinalIgnoreCase) ||
               responseBody.Contains("QUOTA_EXCEEDED", StringComparison.OrdinalIgnoreCase) ||
               responseBody.Contains("rate limit", StringComparison.OrdinalIgnoreCase) ||
               responseBody.Contains("exceeded your current quota", StringComparison.OrdinalIgnoreCase);
    }

    private static string ExtractQuotaErrorMessage(string? responseBody) {
        return "Dịch vụ Google Gemini AI đang tạm thời vượt quá hạn ngạch sử dụng (HTTP 429 Too Many Requests / RESOURCE_EXHAUSTED).\n";
    }

    public async Task<CvEnhanceResult> EnhanceCvAsync(CvEnhanceRequest request, CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(_options.ApiKey)) {
            _logger.LogWarning("Gemini API Key is not configured. Returning fallback mock enhancement.");
            return GeminiPrompts.CreateFallbackEnhancement(request);
        }

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

        try {
            var model = NormalizeModelName(_options.Model);
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_options.ApiKey}";

            var systemPrompt = GeminiPrompts.BuildCvEnhancePrompt(request);

            var payload = new {
                contents = new[] {
                    new {
                        role = "user",
                        parts = new[] {
                            new { text = $"{systemPrompt}\n\nNội dung cần tối ưu:\n\"\"\"{request.Content}\"\"\"" }
                        }
                    }
                },
                generationConfig = new {
                    response_mime_type = "application/json",
                    temperature = 0.2
                }
            };

            var response = await _httpClient.PostAsJsonAsync(url, payload, JsonOptions, cts.Token);
            if (!response.IsSuccessStatusCode) {
                var errorText = await response.Content.ReadAsStringAsync(cts.Token);
                
                // Khi hết Quota: Trả về ngoại lệ rõ ràng kèm hướng dẫn cụ thể
                if (IsQuotaExceeded(response.StatusCode, errorText)) {
                    _logger.LogWarning("Gemini API Quota Exceeded (429): {Error}", errorText);
                    throw AiExceptions.AiQuotaExceeded(ExtractQuotaErrorMessage(errorText));
                }

                // Nếu model chỉ định trả về 404, tự động fallback sang model khả dụng
                if (response.StatusCode == HttpStatusCode.NotFound &&
                    (errorText.Contains("no longer available", StringComparison.OrdinalIgnoreCase) || errorText.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase))) {
                    _logger.LogWarning("Gemini model '{Model}' returned 404 Not Found. Attempting fallback to '{FallbackModel}'.", model, DefaultActiveFallbackModel);
                    var fallbackUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{DefaultActiveFallbackModel}:generateContent?key={_options.ApiKey}";
                    response = await _httpClient.PostAsJsonAsync(fallbackUrl, payload, JsonOptions, cts.Token);

                    if (!response.IsSuccessStatusCode) {
                        errorText = await response.Content.ReadAsStringAsync(cts.Token);
                        if (IsQuotaExceeded(response.StatusCode, errorText)) {
                            _logger.LogWarning("Gemini API Quota Exceeded (429) on fallback model: {Error}", errorText);
                            throw AiExceptions.AiQuotaExceeded(ExtractQuotaErrorMessage(errorText));
                        }
                        _logger.LogWarning("Gemini API fallback returned {StatusCode} ({Error}). Returning template enhancement.", response.StatusCode, errorText);
                        return GeminiPrompts.CreateFallbackEnhancement(request);
                    }
                } else {
                    _logger.LogWarning("Gemini API returned {StatusCode} ({Error}). Falling back to template enhancement.", response.StatusCode, errorText);
                    return GeminiPrompts.CreateFallbackEnhancement(request);
                }
            }

            var resultNode = await response.Content.ReadFromJsonAsync<GeminiGenerateContentResponse>(JsonOptions, cts.Token);
            var candidateText = resultNode?.Candidates?[0]?.Content?.Parts?[0]?.Text;

            if (string.IsNullOrWhiteSpace(candidateText)) {
                return GeminiPrompts.CreateFallbackEnhancement(request);
            }

            var parsed = JsonSerializer.Deserialize<CvEnhanceJsonResult>(candidateText, JsonOptions);

            var originalText = parsed?.OriginalContent ?? request.Content ?? request.CvContext ?? string.Empty;
            return new CvEnhanceResult(
                OriginalContent: originalText,
                EnhancedContent: parsed?.EnhancedContent ?? originalText,
                SuggestedKeywords: (IReadOnlyList<string>?)parsed?.SuggestedKeywords ?? Array.Empty<string>(),
                Improvements: (IReadOnlyList<string>?)parsed?.Improvements ?? Array.Empty<string>(),
                DetectedSection: parsed?.DetectedSection ?? request.SectionType ?? "EXPERIENCE",
                ConversationTitle: parsed?.ConversationTitle
            );
        } catch (AppException) {
            throw;
        } catch (Exception ex) {
            _logger.LogWarning(ex, "Gemini API call failed or timed out. Falling back to template enhancement.");
            return GeminiPrompts.CreateFallbackEnhancement(request);
        }
    }

    public async IAsyncEnumerable<string> StreamEnhanceCvAsync(
        CvEnhanceRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(_options.ApiKey)) {
            var fallback = GeminiPrompts.CreateFallbackEnhancement(request);
            yield return fallback.EnhancedContent;
            yield break;
        }

        var model = NormalizeModelName(_options.Model);
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={_options.ApiKey}";

        var prompt = GeminiPrompts.BuildCvEnhanceStreamPrompt(request);

        var payload = new {
            contents = new[] {
                new {
                    parts = new[] { new { text = prompt } }
                }
            },
            generationConfig = new {
                temperature = 0.2
            }
        };

        using var requestMessage = new HttpRequestMessage(HttpMethod.Post, url) {
            Content = JsonContent.Create(payload)
        };

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

        HttpResponseMessage? response = null;
        string? errorBody = null;
        try {
            response = await _httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseHeadersRead, cts.Token);
            if (!response.IsSuccessStatusCode) {
                errorBody = await response.Content.ReadAsStringAsync(cts.Token);
            }
        } catch {
            response = null;
        }

        // Kiểm tra Quota
        if (response != null && IsQuotaExceeded(response.StatusCode, errorBody)) {
            yield return $"[THÔNG BÁO HẾT QUOTA - 429]: Hạn ngạch Google Gemini AI đã vượt quá giới hạn (RESOURCE_EXHAUSTED).\n\nHướng dẫn xử lý:\n1. Vui lòng đợi 30 - 60 giây để hạn ngạch tần suất (RPM) tự hồi phục rồi thử lại.\n2. Lấy API Key mới tại: https://aistudio.google.com/app/apikey\n3. Cập nhật biến Gemini__ApiKey trong file .env tại thư mục Backend và khởi động lại dịch vụ.\n4. Đảm bảo cấu hình biến Gemini__Model=gemini-3.5-flash-lite.";
            yield break;
        }

        // Nếu 404 trên model, thử fallback sang model khả dụng
        if (response != null && !response.IsSuccessStatusCode && response.StatusCode == HttpStatusCode.NotFound) {
            var fallbackUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{DefaultActiveFallbackModel}:streamGenerateContent?alt=sse&key={_options.ApiKey}";
            using var fallbackReq = new HttpRequestMessage(HttpMethod.Post, fallbackUrl) {
                Content = JsonContent.Create(payload)
            };
            try {
                response = await _httpClient.SendAsync(fallbackReq, HttpCompletionOption.ResponseHeadersRead, cts.Token);
            } catch {
                response = null;
            }
        }

        if (response is null || !response.IsSuccessStatusCode) {
            var fallback = GeminiPrompts.CreateFallbackEnhancement(request);
            yield return fallback.EnhancedContent;
            yield break;
        }

        using (response) {
            using var stream = await response.Content.ReadAsStreamAsync(cts.Token);
            using var reader = new StreamReader(stream);

            bool timeoutOccurred = false;
            bool networkErrorOccurred = false;

            while (true) {
                string? line;
                try {
                    line = await reader.ReadLineAsync(cts.Token);
                } catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) {
                    _logger.LogInformation("Client cancelled CV enhance streaming request.");
                    yield break;
                } catch (OperationCanceledException) {
                    _logger.LogWarning("Gemini CV enhance streaming reached timeout limit of {TimeoutSeconds}s.", _options.TimeoutSeconds);
                    timeoutOccurred = true;
                    break;
                } catch (Exception ex) {
                    _logger.LogWarning(ex, "Network or socket disconnection occurred during Gemini CV enhance streaming.");
                    networkErrorOccurred = true;
                    break;
                }

                if (line is null) break;
                if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data: ")) continue;

                var json = line.Substring(6).Trim();
                if (json == "[DONE]") break;

                GeminiGenerateContentResponse? chunk = null;
                try {
                    chunk = JsonSerializer.Deserialize<GeminiGenerateContentResponse>(json, JsonOptions);
                } catch { }

                var text = chunk?.Candidates?[0]?.Content?.Parts?[0]?.Text;
                if (!string.IsNullOrEmpty(text)) {
                    yield return text;
                }
            }

            if (timeoutOccurred) {
                yield return "\n\n[Lưu ý: Quá trình phản hồi đã đạt giới hạn thời gian (60 giây).]";
            } else if (networkErrorOccurred) {
                yield return "\n\n[Lưu ý: Kết nối mạng tới dịch vụ AI bị gián đoạn giữa chừng.]";
            }
        }
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(_options.ApiKey)) {
            _logger.LogWarning("Gemini API Key is not configured. Generating zero-filled embedding vector.");
            return new float[768];
        }

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

        try {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.EmbeddingModel}:embedContent?key={_options.ApiKey}";

            var payload = new {
                model = $"models/{_options.EmbeddingModel}",
                content = new {
                    parts = new[] { new { text } }
                }
            };

            var response = await _httpClient.PostAsJsonAsync(url, payload, JsonOptions, cts.Token);
            if (!response.IsSuccessStatusCode) {
                var err = await response.Content.ReadAsStringAsync(cts.Token);
                if (IsQuotaExceeded(response.StatusCode, err)) {
                    _logger.LogWarning("Gemini Embedding API Quota Exceeded (429): {Error}", err);
                    throw AiExceptions.AiQuotaExceeded(ExtractQuotaErrorMessage(err));
                }
                _logger.LogError("Gemini Embedding API error: {Error}", err);
                return new float[768];
            }

            var result = await response.Content.ReadFromJsonAsync<GeminiEmbedResponse>(JsonOptions, cts.Token);
            return result?.Embedding?.Values ?? new float[768];
        } catch (AppException) {
            throw;
        } catch (Exception ex) {
            _logger.LogError(ex, "Error generating embedding with Gemini");
            return new float[768];
        }
    }

    public async Task<MatchAnalysisResult> GenerateAnalysisExplanationAsync(
        string cvText,
        string jobText,
        decimal score,
        CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(_options.ApiKey)) {
            return GeminiPrompts.CreateFallbackMatchAnalysis(score);
        }

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

        try {
            var model = NormalizeModelName(_options.Model);
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_options.ApiKey}";

            var prompt = GeminiPrompts.BuildMatchAnalysisPrompt(cvText, jobText, score);

            var payload = new {
                contents = new[] {
                    new {
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new {
                    response_mime_type = "application/json",
                    temperature = 0.2
                }
            };

            var response = await _httpClient.PostAsJsonAsync(url, payload, JsonOptions, cts.Token);
            if (!response.IsSuccessStatusCode) {
                var errorText = await response.Content.ReadAsStringAsync(cts.Token);
                if (IsQuotaExceeded(response.StatusCode, errorText)) {
                    _logger.LogWarning("Gemini API Quota Exceeded (429) during Match Explanation: {Error}", errorText);
                    throw AiExceptions.AiQuotaExceeded(ExtractQuotaErrorMessage(errorText));
                }

                if (response.StatusCode == HttpStatusCode.NotFound &&
                    (errorText.Contains("no longer available", StringComparison.OrdinalIgnoreCase) || errorText.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase))) {
                    var fallbackUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{DefaultActiveFallbackModel}:generateContent?key={_options.ApiKey}";
                    response = await _httpClient.PostAsJsonAsync(fallbackUrl, payload, JsonOptions, cts.Token);
                    if (!response.IsSuccessStatusCode) {
                        return GeminiPrompts.CreateFallbackMatchAnalysis(score);
                    }
                } else {
                    return GeminiPrompts.CreateFallbackMatchAnalysis(score);
                }
            }

            var resultNode = await response.Content.ReadFromJsonAsync<GeminiGenerateContentResponse>(JsonOptions, cts.Token);
            var candidateText = resultNode?.Candidates?[0]?.Content?.Parts?[0]?.Text;
            if (string.IsNullOrWhiteSpace(candidateText)) {
                return GeminiPrompts.CreateFallbackMatchAnalysis(score);
            }

            var parsed = JsonSerializer.Deserialize<MatchAnalysisJsonResult>(candidateText, JsonOptions);
            return new MatchAnalysisResult(
                Score: score,
                Summary: parsed?.Summary ?? $"Hồ sơ ứng viên đạt {score:F2}% độ phù hợp với yêu cầu công việc.",
                MatchingSkills: (IReadOnlyList<string>?)parsed?.MatchingSkills ?? Array.Empty<string>(),
                MissingSkills: (IReadOnlyList<string>?)parsed?.MissingSkills ?? Array.Empty<string>(),
                Strengths: (IReadOnlyList<string>?)parsed?.Strengths ?? Array.Empty<string>(),
                Recommendations: (IReadOnlyList<string>?)parsed?.Recommendations ?? Array.Empty<string>()
            );
        } catch (AppException) {
            throw;
        } catch (Exception ex) {
            _logger.LogError(ex, "Error generating match explanation with Gemini");
            return GeminiPrompts.CreateFallbackMatchAnalysis(score);
        }
    }
}
