using MediatR;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Auth.RegisterAccount;

namespace SmartHire.Application.Features.Auth.RegisterRecruiter;

public sealed class RegisterRecruiterCommandHandler(
    RegisterAccountWorkflow workflow
) : IRequestHandler<RegisterRecruiterCommand, RegisterAccountResult> {
    public Task<RegisterAccountResult> Handle(
        RegisterRecruiterCommand request,
        CancellationToken cancellationToken
    ) => workflow.RegisterAsync(
        request.Email,
        request.Phone,
        request.Password,
        request.FullName,
        roleName: RoleNames.Recruiter,
        cancellationToken);
}
