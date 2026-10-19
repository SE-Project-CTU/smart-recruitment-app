using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Companies.Exceptions;

internal static class CompanyExceptions {
    public static AppException InvalidAccessToken(string? message = null) => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        message ?? "The access token does not contain a valid user id.",
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat, "A valid user identity is required.")]);

    public static AppException Validation(string message, IEnumerable<AppErrorDetail>? details = null) => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        message,
        details?.ToArray() ?? Array.Empty<AppErrorDetail>());

    public static AppException CompanyNotFound() => new(
        AppErrorKind.NotFound,
        CompanyErrorCodes.CompanyNotFound,
        "Company not found.",
        [new AppErrorDetail("companyId", ErrorDetailReasons.NotFound, "The specified company could not be found.")]);

    public static AppException CompanyTaxCodeAlreadyExists() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyTaxCodeAlreadyExists,
        "A company with this tax code already exists.",
        [new AppErrorDetail("taxCode", ErrorDetailReasons.AlreadyExists, "Tax code is already registered.")]);

    public static AppException CompanyForbidden(string? message = null) => new(
        AppErrorKind.Forbidden,
        CompanyErrorCodes.CompanyForbidden,
        message ?? "You are not authorized to perform this operation on the company.");

    public static AppException NotCompanyOwner() => new(
        AppErrorKind.Forbidden,
        CompanyErrorCodes.CompanyForbidden,
        "Only an active Company Owner can perform this action.",
        [new AppErrorDetail("role", ValidationReasons.NotAllowed, "Caller must be an active company owner.")]);

    public static AppException CompanyMembershipAlreadyExists() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyMembershipAlreadyExists,
        "The recruiter is already a member of this company.",
        [new AppErrorDetail("membership", ErrorDetailReasons.AlreadyExists, "Active membership already exists.")]);

    public static AppException UserNotFound(string field = "userId") => new(
        AppErrorKind.NotFound,
        CompanyErrorCodes.UserNotFound,
        "User was not found.",
        [new AppErrorDetail(field, ErrorDetailReasons.NotFound, "The specified user does not exist.")]);

    public static AppException CompanyInvitationNotFound() => new(
        AppErrorKind.NotFound,
        CompanyErrorCodes.CompanyInvitationNotFound,
        "Company invitation was not found.",
        [new AppErrorDetail("invitationId", ErrorDetailReasons.NotFound, "The specified invitation does not exist.")]);

    public static AppException CompanyInvitationAlreadyExists() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyInvitationAlreadyExists,
        "A pending invitation already exists for this recruiter.",
        [new AppErrorDetail("invitation", ErrorDetailReasons.AlreadyExists, "Pending invitation already exists.")]);

    public static AppException CompanyInvitationAlreadyProcessed() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyInvitationAlreadyProcessed,
        "This invitation has already been processed.",
        [new AppErrorDetail("invitation", ValidationReasons.NotAllowed, "Invitation is not in pending status.")]);

    public static AppException CompanyInvitationExpired() => new(
        AppErrorKind.Gone,
        CompanyErrorCodes.CompanyInvitationExpired,
        "This invitation has expired.",
        [new AppErrorDetail("invitation", ErrorDetailReasons.Expired, "The invitation validity period has ended.")]);

    public static AppException CompanyJoinRequestNotFound() => new(
        AppErrorKind.NotFound,
        CompanyErrorCodes.CompanyJoinRequestNotFound,
        "Join request was not found.",
        [new AppErrorDetail("requestId", ErrorDetailReasons.NotFound, "The specified join request does not exist.")]);

    public static AppException CompanyJoinRequestAlreadyExists() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyJoinRequestAlreadyExists,
        "You already have a pending join request for this company.",
        [new AppErrorDetail("joinRequest", ErrorDetailReasons.AlreadyExists, "Pending join request already exists.")]);

    public static AppException CompanyJoinRequestAlreadyProcessed() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyJoinRequestAlreadyProcessed,
        "This join request has already been processed.",
        [new AppErrorDetail("joinRequest", ValidationReasons.NotAllowed, "Join request is not in pending status.")]);

    public static AppException CompanyNewOwnerInvalid(string message) => new(
        AppErrorKind.Validation,
        CompanyErrorCodes.CompanyNewOwnerInvalid,
        message,
        [new AppErrorDetail("newOwnerId", ValidationReasons.NotAllowed, message)]);

    public static AppException InviteeRoleRequired() => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        "Invitee must have the Recruiter role.",
        [new AppErrorDetail("inviteeId", ValidationReasons.NotAllowed, "Only users with the Recruiter role can be invited.")]);

    public static AppException CompanyAlreadyFollowed() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyAlreadyFollowed,
        "You are already following this company.",
        [new AppErrorDetail("companyId", ErrorDetailReasons.AlreadyExists, "Follow relationship already exists.")]);

    public static AppException CompanyNotFollowed() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyNotFollowed,
        "You are not following this company.",
        [new AppErrorDetail("companyId", ErrorDetailReasons.NotFound, "Follow relationship does not exist.")]);

    public static AppException InvalidCompanyData(string message, IEnumerable<AppErrorDetail>? details = null) => new(
        AppErrorKind.BadRequest,
        CompanyErrorCodes.InvalidCompanyData,
        message,
        details?.ToArray() ?? Array.Empty<AppErrorDetail>());

    public static AppException MediaFileNotFound() => new(
        AppErrorKind.NotFound,
        MediaErrorCodes.MediaFileNotFound,
        "Logo file was not found.",
        [new AppErrorDetail("logoFileId", ErrorDetailReasons.NotFound, "The specified logo file could not be found.")]);

    public static AppException MediaFileForbidden() => new(
        AppErrorKind.Forbidden,
        MediaErrorCodes.MediaFileForbidden,
        "Logo file does not belong to the current user.",
        [new AppErrorDetail("logoFileId", ValidationReasons.NotAllowed, "The logo file must belong to the current user.")]);

    public static AppException MediaFileInvalidImage() => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        "Request contains an invalid logo file.",
        [new AppErrorDetail("logoFileId", ValidationReasons.InvalidFormat, "Logo file must be an image.")]);

    public static AppException CompanyLogoAlreadyInUse() => new(
        AppErrorKind.Conflict,
        CompanyErrorCodes.CompanyLogoAlreadyInUse,
        "This logo is already assigned to another company.",
        [new AppErrorDetail("logoFileId", ErrorDetailReasons.AlreadyExists, "This logo is already in use by a company.")]);
}
