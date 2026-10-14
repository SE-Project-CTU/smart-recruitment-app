using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Cv.Queries;

internal static class CvVersionQueryErrors
{
    public static AppException CvNotFound() => new(
        AppErrorKind.NotFound,
        CvErrorCodes.CvNotFound,
        "CV was not found.",
        [new AppErrorDetail(
            "id", ErrorDetailReasons.NotFound, "The requested CV does not exist.")]);

    public static void EnsureOwner(Guid? currentUserId, Guid candidateId)
    {
        if (currentUserId is null)
        {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.",
                [new AppErrorDetail(
                    "userId",
                    ValidationReasons.InvalidFormat,
                    "A valid user identifier could not be read from the access token.")]);
        }

        if (currentUserId != candidateId)
        {
            throw new AppException(
                AppErrorKind.Forbidden,
                CvErrorCodes.CvNotOwned,
                "You are not authorized to access this CV.",
                [new AppErrorDetail(
                    "id",
                    ErrorDetailReasons.NotFound,
                    "The CV does not belong to the current user.")]);
        }
    }
}
