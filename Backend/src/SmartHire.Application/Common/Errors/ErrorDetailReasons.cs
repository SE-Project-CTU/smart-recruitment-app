namespace SmartHire.Application.Common.Errors;

public static class ErrorDetailReasons
{
    public const string NotFound = "NOT_FOUND";
    public const string Inactive = "INACTIVE";
    public const string AlreadyExists = "ALREADY_EXISTS";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string Expired = "EXPIRED";
    public const string StorageError = "STORAGE_ERROR";
    public const string ConcurrentModification = "CONCURRENT_MODIFICATION";
}
