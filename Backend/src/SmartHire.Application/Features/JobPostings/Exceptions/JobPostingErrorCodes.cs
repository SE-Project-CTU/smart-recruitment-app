namespace SmartHire.Application.Features.JobPostings.Exceptions;

public static class JobPostingErrorCodes {
    public const string InvalidJobPosting = "INVALID_JOB_POSTING_DATA";
    public const string CompanyNotFound = "COMPANY_NOT_FOUND";
    public const string CompanyForbidden = "COMPANY_FORBIDDEN";
    public const string ProvinceNotFound = "PROVINCE_NOT_FOUND";
    public const string WardNotFound = "WARD_NOT_FOUND";
    public const string IndustryNotFound = "INDUSTRY_NOT_FOUND";
    public const string SkillNotFound = "SKILL_NOT_FOUND";
    public const string InvalidSearchCriteria = "INVALID_JOB_POSTING_SEARCH";
    public const string InvalidJobPostingId = "INVALID_JOB_POSTING_ID";
    public const string JobPostingNotFound = "JOB_POSTING_NOT_FOUND";
    public const string JobPostingUnauthorized = "JOB_POSTING_UNAUTHORIZED";
    public const string JobPostingForbidden = "JOB_POSTING_FORBIDDEN";
    public const string JobPostingConflict = "JOB_POSTING_CONFLICT";
}
