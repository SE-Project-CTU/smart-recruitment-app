using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Ai.Matching;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Notifications.Constants;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.ApplyToJobPosting;

public sealed class ApplyToJobPostingCommandHandler : IRequestHandler<ApplyToJobPostingCommand, ApplyJobResult> {
    private const long MaximumCvSizeBytes = 5 * 1024 * 1024;
    private const string PdfContentType = "application/pdf";

    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IAiMatchResultRepository _aiMatchResultRepository;
    private readonly ICvEmbeddingRepository _cvEmbeddingRepository;
    private readonly IJobEmbeddingRepository _jobEmbeddingRepository;
    private readonly ISmartHireMatchEngine _matchEngine;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationDispatcher? _notificationDispatcher;
    private readonly IDistributedCache? _distributedCache;
    private readonly ICompanyRepository? _companyRepository;
    private readonly INotificationRepository? _notificationRepository;

    public ApplyToJobPostingCommandHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        IJobApplicationRepository applicationRepository,
        ICvVersionRepository cvVersionRepository,
        IMediaFileRepository mediaFileRepository,
        IAiMatchResultRepository aiMatchResultRepository,
        ICvEmbeddingRepository cvEmbeddingRepository,
        IJobEmbeddingRepository jobEmbeddingRepository,
        ISmartHireMatchEngine matchEngine,
        IUnitOfWork unitOfWork,
        INotificationDispatcher? notificationDispatcher = null,
        IDistributedCache? distributedCache = null,
        ICompanyRepository? companyRepository = null,
        INotificationRepository? notificationRepository = null) {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _applicationRepository = applicationRepository;
        _cvVersionRepository = cvVersionRepository;
        _mediaFileRepository = mediaFileRepository;
        _aiMatchResultRepository = aiMatchResultRepository;
        _cvEmbeddingRepository = cvEmbeddingRepository;
        _jobEmbeddingRepository = jobEmbeddingRepository;
        _matchEngine = matchEngine;
        _unitOfWork = unitOfWork;
        _notificationDispatcher = notificationDispatcher;
        _distributedCache = distributedCache;
        _companyRepository = companyRepository;
        _notificationRepository = notificationRepository;
    }

    public async Task<ApplyJobResult> Handle(
        ApplyToJobPostingCommand request,
        CancellationToken cancellationToken) {
        var candidateId = _currentUser.UserId
            ?? throw new AppException(AppErrorKind.Unauthorized, AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user ID.");
        var jobPostingId = ApplyToJobPostingCommandValidator.Validate(request);
        var now = DateTimeOffset.UtcNow;

        var posting = await _jobPostingRepository.GetForApplicationByIdAsync(jobPostingId, cancellationToken)
            ?? throw ApplicationExceptions.JobNotFound(jobPostingId);

        if (posting.Status != JobPostingStatus.Published ||
            posting.Company.VerificationStatus != CompanyVerificationStatus.Verified ||
            (posting.Deadline is not null && posting.Deadline <= now)) {
            throw ApplicationExceptions.JobNotAcceptingApplications();
        }

        if (await _applicationRepository.ExistsForCandidateAsync(jobPostingId, candidateId, cancellationToken)) {
            throw ApplicationExceptions.DuplicateApplication();
        }

        MediaFile? uploadedCv = null;
        CvVersion? cvVersion = null;
        if (request.CvVersionId is Guid cvVersionId) {
            cvVersion = await _cvVersionRepository.GetByVersionIdAsync(cvVersionId, cancellationToken);
            if (cvVersion is null || !await _cvVersionRepository.IsOwnedByCandidateAsync(cvVersionId, candidateId, cancellationToken)) {
                throw ApplicationExceptions.CvVersionNotFound();
            }
        } else if (request.UploadedCvFileId is Guid fileId) {
            uploadedCv = await _mediaFileRepository.GetByIdAsync(fileId, cancellationToken)
                ?? throw ApplicationExceptions.UploadedCvNotFound();
            if (uploadedCv.OwnerId != candidateId) throw ApplicationExceptions.UploadedCvNotFound();
            if (!string.Equals(uploadedCv.FileType, PdfContentType, StringComparison.OrdinalIgnoreCase)) {
                throw ApplicationExceptions.UploadedCvNotPdf();
            }
            if (uploadedCv.FileSize > MaximumCvSizeBytes) {
                throw ApplicationExceptions.UploadedCvTooLarge(MaximumCvSizeBytes);
            }
            if (await _applicationRepository.IsUploadedCvFileInUseAsync(fileId, cancellationToken)) {
                throw ApplicationExceptions.UploadedCvAlreadyUsed();
            }
        }

        var application = JobApplication.Create(
            jobPostingId,
            candidateId,
            request.CvVersionId,
            request.UploadedCvFileId,
            request.CoverLetter,
            now);
        var initialHistory = ApplicationStatusHistory.Create(application, candidateId, null, now);
        application.StatusHistories.Add(initialHistory);

        try {
            await _unitOfWork.ExecuteInTransactionAsync(async ct => {
                await _applicationRepository.AddAsync(application, ct);
                // Lấy ID do database cấp trước khi tạo kết quả chấm điểm tham chiếu đến đơn.
                await _unitOfWork.SaveChangesAsync(ct);

                if (request.CvVersionId is Guid cvVerId && cvVersion?.Content is not null) {
                    var jobDetail = await _jobPostingRepository.GetDetailByIdAsync(jobPostingId, ct);
                    if (jobDetail is not null) {
                        decimal? semanticVectorSimilarity = null;
                        try {
                            var cvEmb = await _cvEmbeddingRepository.GetByCvVersionIdAsync(cvVerId, ct);
                            var jobEmb = await _jobEmbeddingRepository.GetByJobIdAsync(jobPostingId, ct);
                            if (cvEmb?.Embedding != null && jobEmb?.Embedding != null) {
                                semanticVectorSimilarity = TryComputeCosineSimilarity(cvEmb.Embedding, jobEmb.Embedding);
                            }
                        } catch {
                            // Graceful degradation: nếu chưa có vector, Match Engine vẫn chạy chuẩn xác theo Lexical + Fuzzy
                        }

                        var matchResult = _matchEngine.Evaluate(
                            cvVersion.Content,
                            jobDetail,
                            semanticVectorSimilarity: semanticVectorSimilarity);

                        var analysisJson = JsonSerializer.Serialize(new {
                            matchResult.Score,
                            matchResult.Breakdown,
                            matchResult.MatchingSkills,
                            matchResult.MissingSkills,
                            matchResult.Summary
                        });
                        var aiMatchResult = AiMatchResult.Create(
                            application.Id,
                            cvVerId,
                            (decimal)matchResult.Score,
                            analysisJson,
                            now);
                        await _aiMatchResultRepository.AddAsync(aiMatchResult, ct);
                    }
                }

                await _unitOfWork.SaveChangesAsync(ct);
                return true;
            }, cancellationToken);
        }
        catch (PersistenceUniqueConstraintViolationException exception) when (
            string.Equals(
                exception.ConstraintName,
                "ix_applications_candidate_id_job_id",
                StringComparison.OrdinalIgnoreCase)) {
            throw ApplicationExceptions.DuplicateApplication();
        }

        var companyId = posting.CompanyId;
        Notification? representativeNotification = null;

        // 1. Lưu / gộp thông báo vào Database cho các thành viên Active của công ty (kể cả khi đang burst)
        if (_notificationRepository is not null) {
            try {
                IReadOnlyList<Guid> recipientIds;
                if (_companyRepository is not null) {
                    var (members, _) = await _companyRepository.GetMembersPagedAsync(
                        companyId,
                        CompanyMembershipStatus.Active,
                        page: 1,
                        pageSize: 100,
                        cancellationToken);
                    recipientIds = members
                        .Select(m => m.UserId)
                        .Where(id => id != Guid.Empty)
                        .Distinct()
                        .ToList();

                    if (recipientIds.Count == 0 && posting.CreatedBy != Guid.Empty) {
                        recipientIds = [posting.CreatedBy];
                    }
                } else {
                    recipientIds = posting.CreatedBy != Guid.Empty
                        ? [posting.CreatedBy]
                        : Array.Empty<Guid>();
                }

                if (recipientIds.Count > 0) {
                    var existingUnread = await _notificationRepository.GetUnreadByRecipientsAndResourceAsync(
                        recipientIds,
                        NotificationType.JobApplicationReceived,
                        "JobPosting",
                        jobPostingId,
                        cancellationToken);

                    var existingByRecipient = existingUnread
                        .GroupBy(n => n.RecipientId)
                        .ToDictionary(g => g.Key, g => g.First());

                    var newNotifications = new List<Notification>();
                    const string notifTitle = "Hồ sơ ứng tuyển mới";

                    foreach (var recipientId in recipientIds) {
                        if (existingByRecipient.TryGetValue(recipientId, out var existing)) {
                            var nextCount = ExtractApplicationCount(existing.Payload) + 1;
                            var aggregatedBody = $"Đã có {nextCount} ứng viên nộp hồ sơ vào vị trí \"{posting.Title}\".";
                            var aggregatedPayload = BuildApplicationPayload(application.Id, jobPostingId, nextCount);
                            existing.AggregateUpdate(notifTitle, aggregatedBody, aggregatedPayload, now);
                            representativeNotification ??= existing;
                        } else {
                            var singleBody = $"Có ứng viên vừa nộp hồ sơ vào vị trí \"{posting.Title}\".";
                            var singlePayload = BuildApplicationPayload(application.Id, jobPostingId, 1);
                            var created = Notification.Create(
                                recipientId: recipientId,
                                type: NotificationType.JobApplicationReceived,
                                title: notifTitle,
                                body: singleBody,
                                payload: singlePayload,
                                resourceType: "JobPosting",
                                resourceId: jobPostingId,
                                now: now);
                            newNotifications.Add(created);
                            representativeNotification ??= created;
                        }
                    }

                    if (newNotifications.Count > 0) {
                        await _notificationRepository.AddRangeAsync(newNotifications, cancellationToken);
                    }

                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                }
            }
            catch {
                // Nuốt lỗi thông báo để không bao giờ làm gián đoạn đơn ứng tuyển đã nộp thành công
            }
        }

        // 2. Phát realtime qua SignalR (chống bão toast trong cửa sổ 10 giây)
        if (_notificationDispatcher is not null) {
            try {
                var throttleKey = $"notify_burst:company:{companyId:D}:job:{jobPostingId:D}";
                bool isThrottled = false;

                if (_distributedCache is not null) {
                    var cached = await _distributedCache.GetStringAsync(throttleKey, cancellationToken);
                    if (!string.IsNullOrEmpty(cached)) {
                        isThrottled = true;
                    }
                    else {
                        // Cửa sổ chống bão thông báo, burst traffic 10 giây
                        await _distributedCache.SetStringAsync(
                            throttleKey,
                            "1",
                            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(10) },
                            cancellationToken);
                    }
                }

                if (!isThrottled) {
                    // Đơn đầu tiên trong cửa sổ 10s: Gửi Toast notification đầy đủ tới phòng công ty
                    object notificationDto = representativeNotification is not null
                        ? NotificationResultMapper.ToDto(representativeNotification)
                        : new {
                            id = Guid.NewGuid(),
                            type = NotificationType.JobApplicationReceived.ToString(),
                            title = "Hồ sơ ứng tuyển mới",
                            body = $"Có ứng viên vừa nộp hồ sơ vào vị trí \"{posting.Title}\".",
                            payload = BuildApplicationPayload(application.Id, jobPostingId, 1),
                            resourceType = "JobPosting",
                            resourceId = jobPostingId,
                            createdAt = application.AppliedAt,
                            isRead = false
                        };

                    await _notificationDispatcher.DispatchToCompanyAsync(companyId, notificationDto, cancellationToken);
                }
                else {
                    // Khi có lượng lớn ứng viên nộp dồn dập trong 10s:
                    // Chỉ bắn sự kiện tăng bộ đếm nhẹ để UI nhảy số badge + cập nhật chuông, không gây bão toast
                    await _notificationDispatcher.DispatchToGroupAsync(
                        NotificationGroups.Company(companyId),
                        "ApplicationCounterUpdated",
                        new {
                            jobId = jobPostingId,
                            companyId = companyId,
                            delta = 1,
                            timestamp = DateTimeOffset.UtcNow
                        },
                        cancellationToken);
                }
            }
            catch {
                // Nuốt lỗi thông báo để không bao giờ làm gián đoạn đơn ứng tuyển đã nộp thành công
            }
        }

        return new ApplyJobResult(
            application.Id,
            application.JobId,
            application.CvVersionId,
            uploadedCv?.FileUrl,
            application.CoverLetter,
            "SUBMITTED",
            application.AppliedAt,
            application.UpdatedAt);
    }

    private static decimal? TryComputeCosineSimilarity(Pgvector.Vector v1, Pgvector.Vector v2) {
        var a = v1.ToArray();
        var b = v2.ToArray();
        if (a.Length != b.Length || a.Length == 0) return null;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.Length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        double denom = Math.Sqrt(normA) * Math.Sqrt(normB);
        if (denom <= 0) return null;
        return (decimal)Math.Clamp(dot / denom, 0.0, 1.0);
    }

    private static string BuildApplicationPayload(Guid applicationId, Guid jobId, int count) {
        return JsonSerializer.Serialize(new {
            applicationId,
            jobId,
            count
        });
    }

    private static int ExtractApplicationCount(string? payloadJson) {
        if (string.IsNullOrWhiteSpace(payloadJson)) return 1;
        try {
            using var doc = JsonDocument.Parse(payloadJson);
            if (doc.RootElement.TryGetProperty("count", out var countProp) &&
                countProp.TryGetInt32(out var count) &&
                count > 0) {
                return count;
            }
        }
        catch {
            // ignore parse error
        }
        return 1;
    }
}
