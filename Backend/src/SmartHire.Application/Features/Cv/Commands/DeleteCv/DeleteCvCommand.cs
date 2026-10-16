using MediatR;

namespace SmartHire.Application.Features.Cv.Commands.DeleteCv;

public sealed record DeleteCvCommand(Guid Id) : IRequest;
