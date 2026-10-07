using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Account.GetCurrentAccount;

public sealed class GetCurrentAccountQueryHandler
    : IRequestHandler<GetCurrentAccountQuery, CurrentAccountResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IUserRepository _userRepository;
    
    public GetCurrentAccountQueryHandler(
        ICurrentUser currentUser,
        IUserRepository userRepository
    ) {
        _currentUser = currentUser;
        _userRepository = userRepository;
    }
    
    public async Task<CurrentAccountResult>
        Handle(GetCurrentAccountQuery request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }
        
        var account = await _userRepository.GetCurrentAccountAsync(userId, cancellationToken);
        
        if (account is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                AuthErrorCodes.CurrentAccountNotFound,
                "The account was not found.");
        }
        
        return new CurrentAccountResult(
            account.Id,
            account.Email,
            account.Phone,
            account.FullName,
            account.AvatarUrl,
            account.Roles,
            account.Status.ToString(),
            account.CreatedAt,
            account.UpdatedAt
        );
    }
}