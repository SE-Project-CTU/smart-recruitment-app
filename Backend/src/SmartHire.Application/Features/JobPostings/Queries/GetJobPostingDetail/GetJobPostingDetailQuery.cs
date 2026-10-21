using MediatR;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Queries.GetJobPostingDetail;

public sealed record GetJobPostingDetailQuery(string? JobId) : IRequest<JobPostingDetailResult>;
