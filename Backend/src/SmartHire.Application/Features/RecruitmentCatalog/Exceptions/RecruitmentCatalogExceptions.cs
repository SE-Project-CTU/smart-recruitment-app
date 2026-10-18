using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.RecruitmentCatalog.Exceptions;

internal static class RecruitmentCatalogExceptions
{
    public static AppException IndustryGroupNotFound() => new(
        AppErrorKind.NotFound,
        RecruitmentCatalogErrorCodes.IndustryGroupNotFound,
        "Industry group was not found.",
        [new AppErrorDetail("groupId", ErrorDetailReasons.NotFound,
            "The specified industry group does not exist.")]);
}

internal static class RecruitmentCatalogErrorCodes
{
    public const string IndustryGroupNotFound = "INDUSTRY_GROUP_NOT_FOUND";
}
