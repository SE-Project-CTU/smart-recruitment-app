using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartHire.Api.Factories;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Ai.Commands.CreateConversation;
using SmartHire.Application.Features.Ai.Commands.DeleteAllConversations;
using SmartHire.Application.Features.Ai.Commands.DeleteConversation;
using SmartHire.Application.Features.Ai.Commands.EnhanceCv;
using SmartHire.Application.Features.Ai.Commands.EnhanceCvBatch;
using SmartHire.Application.Features.Ai.Commands.MatchAnalysis;
using SmartHire.Application.Features.Ai.Commands.RefreshRecommendations;
using SmartHire.Application.Features.Ai.Commands.SendMessage;
using SmartHire.Application.Features.Ai.Commands.TogglePin;
using SmartHire.Application.Features.Ai.Common;
using SmartHire.Application.Features.Ai.Queries.GetApplicationMatchResult;
using SmartHire.Application.Features.Ai.Queries.GetConversationDetail;
using SmartHire.Application.Features.Ai.Queries.GetConversations;
using SmartHire.Application.Features.Ai.Queries.GetRecommendations;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/ai")]
[EnableRateLimiting("ai-assistant")]
public sealed class AiController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    private readonly IGeminiAiService _geminiAiService;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IJobPostingRepository _jobPostingRepository;

    public AiController(
        ISender sender,
        ApiResponseFactory responseFactory,
        IGeminiAiService geminiAiService,
        ICvVersionRepository cvVersionRepository,
        IJobPostingRepository jobPostingRepository) {
        _sender = sender;
        _responseFactory = responseFactory;
        _geminiAiService = geminiAiService;
        _cvVersionRepository = cvVersionRepository;
        _jobPostingRepository = jobPostingRepository;
    }

    /// <summary>
    /// Trợ lý viết CV - Gợi ý từ ngữ & Tối ưu hóa nội dung chuẩn Google XYZ
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPost("cv/enhance")]
    public async Task<IActionResult> EnhanceCv(
        [FromBody] EnhanceCvCommand command,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Trợ lý viết CV - Tối ưu hóa đồng thời toàn bộ các mục CV (Batching trong 1 request duy nhất)
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPost("cv/enhance/batch")]
    public async Task<IActionResult> EnhanceCvBatch(
        [FromBody] EnhanceCvBatchCommand command,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Trợ lý viết CV - Real-time Streaming qua SSE theo chuẩn Google XYZ
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPost("cv/enhance/stream")]
    public async Task StreamEnhanceCv(
        [FromBody] EnhanceCvCommand command,
        CancellationToken cancellationToken = default) {
        EnhanceCvCommandValidator.Validate(command);

        var request = await CvEnhanceContextResolver.ResolveAsync(
            command,
            _cvVersionRepository,
            _jobPostingRepository,
            cancellationToken
        );

        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";
        Response.Headers["X-Accel-Buffering"] = "no";

        await foreach (var token in _geminiAiService.StreamEnhanceCvAsync(request, cancellationToken)) {
            await Response.WriteAsync($"data: {token}\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }

        await Response.WriteAsync("data: [DONE]\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    /// <summary>
    /// Phân tích & Chấm điểm độ phù hợp giữa CV và JD
    /// </summary>
    [Authorize]
    [HttpPost("match-analysis")]
    public async Task<IActionResult> MatchAnalysis(
        [FromBody] MatchAnalysisCommand command,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Xem kết quả phân tích AI của đơn ứng tuyển
    /// </summary>
    [Authorize]
    [HttpGet("applications/{applicationId:guid}/match-result")]
    public async Task<IActionResult> GetApplicationMatchResult(
        Guid applicationId,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new GetApplicationMatchResultQuery(applicationId), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Danh sách việc làm gợi ý thông minh cho Ứng viên
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations(
        [FromQuery] decimal? minScore,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var result = await _sender.Send(new GetRecommendationsQuery(minScore, page, pageSize), cancellationToken);
        return Ok(_responseFactory.PagedOneBased(
            result.Items,
            result.Page,
            result.PageSize,
            result.TotalItems
        ));
    }

    /// <summary>
    /// Yêu cầu làm mới gợi ý việc làm (Hangfire Background)
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPost("recommendations/refresh")]
    public async Task<IActionResult> RefreshRecommendations(
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new RefreshRecommendationsCommand(), cancellationToken);
        return Accepted(_responseFactory.Success(result));
    }

    /// <summary>
    /// Lấy danh sách các cuộc trò chuyện (Phân nhóm Pinned và Recent, hỗ trợ tìm kiếm)
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(
        [FromQuery] string? search,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new GetConversationsQuery(search), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Xóa toàn bộ cuộc trò chuyện của ứng viên hiện tại
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpDelete("conversations")]
    public async Task<IActionResult> DeleteAllConversations(CancellationToken cancellationToken) {
        var result = await _sender.Send(new DeleteAllConversationsCommand(), cancellationToken);
        return Ok(_responseFactory.Success(new { deletedCount = result }));
    }

    /// <summary>
    /// Tạo một cuộc trò chuyện AI mới
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPost("conversations")]
    public async Task<IActionResult> CreateConversation(
        [FromBody] CreateConversationRequest request,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new CreateConversationCommand(request.Title, request.CvId), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Lấy chi tiết toàn bộ tin nhắn của cuộc trò chuyện để mở tại Current Window
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpGet("conversations/{conversationId:guid}")]
    public async Task<IActionResult> GetConversationDetail(
        Guid conversationId,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new GetConversationDetailQuery(conversationId), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Gửi tin nhắn vào cuộc trò chuyện và nhận câu trả lời từ AI
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPost("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> SendMessage(
        Guid conversationId,
        [FromBody] SendMessageRequest request,
        CancellationToken cancellationToken) {
        var command = new SendMessageCommand(
            conversationId,
            request.Content,
            request.SectionType,
            request.TargetJobTitle,
            request.Language
        );
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Ghim hoặc Bỏ ghim một cuộc trò chuyện
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpPatch("conversations/{conversationId:guid}/pin")]
    public async Task<IActionResult> TogglePin(
        Guid conversationId,
        [FromBody] TogglePinRequest? request,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new TogglePinCommand(conversationId, request?.IsPinned), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Xóa một cuộc trò chuyện AI
    /// </summary>
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpDelete("conversations/{conversationId:guid}")]
    public async Task<IActionResult> DeleteConversation(
        Guid conversationId,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(new DeleteConversationCommand(conversationId), cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

public sealed record CreateConversationRequest(string? Title, Guid? CvId);
public sealed record SendMessageRequest(string Content, string? SectionType, string? TargetJobTitle, string? Language);
public sealed record TogglePinRequest(bool? IsPinned);
