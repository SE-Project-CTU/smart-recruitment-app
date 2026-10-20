namespace SmartHire.Application.Features.JobPostings.Exceptions;

internal static class JobPostingErrorCodes {
    public const string InvalidJobPosting = "INVALID_JOB_POSTING_DATA";
    public const string CompanyNotFound = "COMPANY_NOT_FOUND";
    public const string CompanyForbidden = "COMPANY_FORBIDDEN";
    public const string ProvinceNotFound = "PROVINCE_NOT_FOUND";
    public const string WardNotFound = "WARD_NOT_FOUND";
    public const string IndustryNotFound = "INDUSTRY_NOT_FOUND";
    public const string SkillNotFound = "SKILL_NOT_FOUND";
    public const string InvalidSearchCriteria = "INVALID_JOB_POSTING_SEARCH";
}
