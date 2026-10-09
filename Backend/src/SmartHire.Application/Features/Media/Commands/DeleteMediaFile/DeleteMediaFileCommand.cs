using MediatR;

namespace SmartHire.Application.Features.Media.Commands.DeleteMediaFile;

public sealed record DeleteMediaFileCommand(Guid FileId) : IRequest<DeleteMediaFileResult>;

public sealed record DeleteMediaFileResult(Guid Id, bool Deleted);
