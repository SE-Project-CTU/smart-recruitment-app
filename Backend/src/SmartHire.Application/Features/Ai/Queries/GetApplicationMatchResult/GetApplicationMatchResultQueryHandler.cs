using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;

namespace SmartHire.Application.Features.Ai.Queries.GetApplicationMatchResult;

public sealed class GetApplicationMatchResultQueryHandler : IRequestHandler<GetApplicationMatchResultQuery, ApplicationMatchResultDto> {
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IAiMatchResultRepository _aiMatchResultRepository;
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public GetApplicationMatchResultQueryHandler(
        IJobApplicationRepository applicationRepository,
        IAiMatchResultRepository aiMatchResultRepository,
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _applicationRepository = applicationRepository;
        _aiMatchResultRepository = aiMatchResultRepository;
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<ApplicationMatchResultDto> Handle(
        GetApplicationMatchResultQuery request,
        CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var userId = _currentUser.UserId.Value;

        var application = await _applicationRepository.GetDetailByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null) {
            throw AiExceptions.ApplicationNotFound(request.ApplicationId);
        }

        // Check authorization: Candidate who applied or Company member of the job posting
        var isCandidate = application.Candidate.Id == userId;
        var isRecruiterOfCompany = false;

        if (!isCandidate) {
            var membership = await _companyRepository.GetMembershipAsync(
                application.CompanyId,
                userId,
                cancellationToken);
            isRecruiterOfCompany = membership != null;
        }

        if (!isCandidate && !isRecruiterOfCompany) {
            throw AiExceptions.Forbidden("Bạn không có quyền xem kết quả phân tích của đơn ứng tuyển này.");
        }

        var matchResult = await _aiMatchResultRepository.GetByApplicationIdAsync(request.ApplicationId, cancellationToken);
        if (matchResult == null) {
            throw AiExceptions.MatchResultNotFound(request.ApplicationId);
        }

        return AiResultMapper.ToApplicationMatchResultDto(matchResult);
    }
}
