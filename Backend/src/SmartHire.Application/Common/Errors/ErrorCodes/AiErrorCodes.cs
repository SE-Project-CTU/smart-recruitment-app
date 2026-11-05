namespace SmartHire.Application.Common.Errors;

public static class AiErrorCodes {
    public const string AiServiceUnavailable = "AI_SERVICE_UNAVAILABLE";
    public const string AiQuotaExceeded = "AI_QUOTA_EXCEEDED";
    public const string NoCvEmbeddingFound = "NO_CV_EMBEDDING_FOUND";
    public const string RefreshCooldownActive = "REFRESH_COOLDOWN_ACTIVE";
    public const string CvNotFound = "CV_NOT_FOUND";
    public const string JobPostingNotFound = "JOB_POSTING_NOT_FOUND";
    public const string ApplicationNotFound = "APPLICATION_NOT_FOUND";
    public const string MatchResultNotFound = "MATCH_RESULT_NOT_FOUND";
    public const string ConversationNotFound = "CONVERSATION_NOT_FOUND";
}

