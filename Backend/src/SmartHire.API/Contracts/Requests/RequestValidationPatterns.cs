namespace SmartHire.Api.Contracts.Requests;

internal static class RequestValidationPatterns
{
    public const string VietnamesePhone = @"^(?:\+?84|0)[35789]\d{8}$";
    public const string CvLanguage = "^(vi|en)$";
}
