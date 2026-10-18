using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.IndustryCatalog.Exceptions;

internal static class IndustryCatalogExceptions
{
    public static AppException IndustryGroupNotFound() => new(
        AppErrorKind.NotFound,
        IndustryCatalogErrorCodes.IndustryGroupNotFound,
        "Industry group was not found.",
        [new AppErrorDetail("groupId", ErrorDetailReasons.NotFound,
            "The specified industry group does not exist.")]);
}

internal static class IndustryCatalogErrorCodes
{
    public const string IndustryGroupNotFound = "INDUSTRY_GROUP_NOT_FOUND";
}
