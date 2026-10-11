using MediatR;

namespace SmartHire.Application.Features.Account.UpdateCurrentAccount;

public sealed record UpdateCurrentAccountCommand(
    bool FullNameProvided,
    string? FullName,
    bool PhoneProvided,
    string? Phone,
    bool AvatarFileIdProvided,
    Guid? AvatarFileId
) : IRequest<UpdateCurrentAccountResult>;