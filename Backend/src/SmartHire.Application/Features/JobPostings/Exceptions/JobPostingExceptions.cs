using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.JobPostings.Exceptions;

internal static class JobPostingExceptions
{
    public static AppException Validation(IEnumerable<AppErrorDetail> details) => new(
        AppErrorKind.Validation,
        JobPostingErrorCodes.InvalidJobPosting,
        "Job posting request contains invalid fields.",
        details.ToArray());

    public static AppException CompanyNotFound() => new(
        AppErrorKind.NotFound,
        JobPostingErrorCodes.CompanyNotFound,
        "Company was not found.",
        [new AppErrorDetail("companyId", ErrorDetailReasons.NotFound,
            "The specified company does not exist.")]);

    public static AppException CompanyForbidden(string message) => new(
        AppErrorKind.Forbidden,
        JobPostingErrorCodes.CompanyForbidden,
        message,
        [new AppErrorDetail("companyId", ValidationReasons.NotAllowed, message)]);

    public static AppException ProvinceNotFound() => new(
        AppErrorKind.NotFound,
        JobPostingErrorCodes.ProvinceNotFound,
        "Province was not found or is inactive.",
        [new AppErrorDetail("provinceId", ErrorDetailReasons.NotFound,
            "The specified active province does not exist.")]);

    public static AppException WardNotFound() => new(
        AppErrorKind.NotFound,
        JobPostingErrorCodes.WardNotFound,
        "Ward was not found or is inactive.",
        [new AppErrorDetail("wardId", ErrorDetailReasons.NotFound,
            "The specified active ward does not exist.")]);

    public static AppException IndustryNotFound(IEnumerable<Guid> ids) => new(
        AppErrorKind.NotFound,
        JobPostingErrorCodes.IndustryNotFound,
        "One or more industries were not found or are inactive.",
        [new AppErrorDetail("industryIds", ErrorDetailReasons.NotFound,
            $"Unknown or inactive industry IDs: {string.Join(", ", ids)}.")]);

    public static AppException SkillNotFound(IEnumerable<Guid> ids) => new(
        AppErrorKind.NotFound,
        JobPostingErrorCodes.SkillNotFound,
        "One or more skills were not found or are inactive.",
        [new AppErrorDetail("skillIds", ErrorDetailReasons.NotFound,
            $"Unknown or inactive skill IDs: {string.Join(", ", ids)}.")]);

    public static AppException InvalidSearchCriteria(IEnumerable<AppErrorDetail> details) => new(
        AppErrorKind.BadRequest,
        JobPostingErrorCodes.InvalidSearchCriteria,
        "Job posting search contains invalid fields.",
        details.ToArray());

    public static AppException InvalidAccessToken() => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        "The access token does not contain a valid user ID.",
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
            "A valid user identity is required.")]);

    public static AppException InvalidJobPostingId() => new(
        AppErrorKind.BadRequest,
        JobPostingErrorCodes.InvalidJobPostingId,
        "Job posting ID has an invalid format.",
        [new AppErrorDetail("id", ValidationReasons.InvalidFormat,
            "The id path parameter must be a valid UUID.")]);

    public static AppException JobPostingNotFound(Guid id) => new(
        AppErrorKind.NotFound,
        JobPostingErrorCodes.JobPostingNotFound,
        "Job posting was not found.",
        [new AppErrorDetail("id", ErrorDetailReasons.NotFound,
            $"No job posting with ID '{id}' exists.")]);

    public static AppException JobPostingUnauthorized() => new(
        AppErrorKind.Unauthorized,
        JobPostingErrorCodes.JobPostingUnauthorized,
        "Authentication is required to view this job posting.");

    public static AppException JobPostingForbidden() => new(
        AppErrorKind.Forbidden,
        JobPostingErrorCodes.JobPostingForbidden,
        "You do not have permission to view this job posting.");
}
