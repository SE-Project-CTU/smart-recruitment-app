using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Auth.RegisterCandidate;

public sealed class RegisterCandidateCommandHandler
    : IRequestHandler<RegisterCandidateCommand, RegisterCandidateResult> {
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _users;
    private readonly IRoleRepository _roles;
    private readonly IPasswordHasher _passwordHasher;
    
    public RegisterCandidateCommandHandler(
        IUnitOfWork unitOfWork,
        IUserRepository users,
        IRoleRepository roles,
        IPasswordHasher passwordHasher
    ) {
        _unitOfWork = unitOfWork;
        _users = users;
        _roles = roles;
        _passwordHasher = passwordHasher;
    }
    
    public async Task<RegisterCandidateResult> Handle(RegisterCandidateCommand request,
        CancellationToken cancellationToken) {
        request = RegisterCandidateCommandValidator.ValidateAndNormalize(request);

        var email = request.Email;
        var phone = request.Phone;
        var fullName = request.FullName;
        
        if (await _users.EmailExistsAsync(email, cancellationToken)) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.EmailAlreadyExists,
                "Email already exists."
            );
        }
        
        if (phone is not null && await _users.PhoneExistsAsync(phone, cancellationToken)) {
            throw new AppException(
                AppErrorKind.Conflict,
                AuthErrorCodes.PhoneAlreadyExists,
                "Phone number already exists."
            );
        }
        
        var candidateRole = await _roles.GetByNameAsync(
            "Candidate",
            cancellationToken
        );
        
        if (candidateRole is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CommonErrorCodes.CandidateRoleNotFound,
                "Required role 'Candidate' was not found."
            );
        }
        
        var passwordHash = _passwordHasher.Hash(request.Password);
        
        var user = User.Create(
            email,
            phone,
            passwordHash,
            fullName,
            DateTimeOffset.UtcNow
        );
        
        return await _unitOfWork.ExecuteInTransactionAsync(
            async transactionToken => {
                await _users.AddAsync(user, transactionToken);
                
                await _users.SaveChangeAsync(transactionToken);
                
                user.AssignRole(candidateRole);
                
                await _users.SaveChangeAsync(transactionToken);
                
                return new RegisterCandidateResult(
                    user.Id,
                    user.Email,
                    user.Phone,
                    user.FullName,
                    new[] { candidateRole.Name },
                    user.Status.ToString(),
                    user.CreatedAt
                );
            },
            cancellationToken
        );
    }
}
