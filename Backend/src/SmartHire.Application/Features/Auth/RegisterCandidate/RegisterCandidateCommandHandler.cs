using MediatR;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Auth.RegisterAccount;

namespace SmartHire.Application.Features.Auth.RegisterCandidate;

public sealed class RegisterCandidateCommandHandler(
    RegisterAccountWorkflow workflow
) : IRequestHandler<RegisterCandidateCommand, RegisterAccountResult> {
    public Task<RegisterAccountResult> Handle(
        RegisterCandidateCommand request,
        CancellationToken cancellationToken
    ) => workflow.RegisterAsync(
        request.Email,
        request.Phone,
        request.Password,
        request.FullName,
        roleName: RoleNames.Candidate,
        cancellationToken);
}
