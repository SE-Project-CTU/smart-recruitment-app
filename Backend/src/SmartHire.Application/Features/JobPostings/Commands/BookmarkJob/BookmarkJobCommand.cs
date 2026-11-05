using MediatR;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Commands.BookmarkJob;

public sealed record BookmarkJobCommand(Guid JobPostingId) : IRequest<BookmarkJobResult>;

