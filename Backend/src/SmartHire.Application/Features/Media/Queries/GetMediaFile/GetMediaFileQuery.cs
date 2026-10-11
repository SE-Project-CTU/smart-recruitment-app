using MediatR;

namespace SmartHire.Application.Features.Media.Queries.GetMediaFile;

public sealed record GetMediaFileQuery(Guid FileId) : IRequest<MediaFileResult>;
