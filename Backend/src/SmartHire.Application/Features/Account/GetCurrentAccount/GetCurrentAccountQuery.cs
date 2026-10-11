using MediatR;

namespace SmartHire.Application.Features.Account.GetCurrentAccount;

public sealed record GetCurrentAccountQuery : IRequest<CurrentAccountResult>;