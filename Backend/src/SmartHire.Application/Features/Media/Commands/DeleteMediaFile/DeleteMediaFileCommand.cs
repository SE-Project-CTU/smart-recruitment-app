using MediatR;
using SmartHire.Application.Features.Media.DTOs;

namespace SmartHire.Application.Features.Media.Commands.DeleteMediaFile;

public sealed record DeleteMediaFileCommand(Guid FileId) : IRequest<DeleteMediaFileResult>;
