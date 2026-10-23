using MediatR;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Queries.GetApplicationDetail;

public sealed record GetApplicationDetailQuery(Guid ApplicationId) : IRequest<JobApplicationResult>;
