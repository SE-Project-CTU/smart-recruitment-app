using System.Text.Json;
using MediatR;
using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.Commands.EnhanceCv;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Commands.SendMessage;

public sealed record SendMessageCommand(
    Guid ConversationId,
    string Content,
    string? SectionType = "EXPERIENCE",
    string? TargetJobTitle = null,
    string? Language = "vi"
) : IRequest<AiMessageDto>;

public sealed class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, AiMessageDto> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly IGeminiAiService _geminiAiService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;

    public SendMessageCommandHandler(
        IAiConversationRepository conversationRepository,
        IGeminiAiService geminiAiService,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _geminiAiService = geminiAiService;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<AiMessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        if (string.IsNullOrWhiteSpace(request.Content)) {
            throw AiExceptions.Validation("Nội dung tin nhắn không được để trống.");
        }


        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken);
        if (conversation == null) {
            throw AiExceptions.NotFound("Cuộc trò chuyện không tồn tại.");
        }

        if (conversation.CandidateId != _currentUser.UserId.Value) {
            throw AiExceptions.Forbidden("Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này.");
        }

        // Lưu tin nhắn của User
        var userMessage = AiMessage.CreateUserMessage(conversation.Id, request.Content.Trim());
        await _conversationRepository.AddMessageAsync(userMessage, cancellationToken);
        conversation.Touch();

        // Gọi Gemini để sinh câu trả lời
        var sectionType = EnhanceCvCommandValidator.NormalizeSectionType(request.SectionType) ?? "EXPERIENCE";
        var enhanceResult = await _geminiAiService.EnhanceCvAsync(
            new CvEnhanceRequest(
                Content: request.Content.Trim(),
                SectionType: sectionType,
                TargetJobTitle: request.TargetJobTitle,
                Language: request.Language ?? "vi"
            ),
            cancellationToken
        );

        // Đổi tên cuộc trò chuyện tự động theo nội dung câu hỏi đầu tiên (theo chuẩn Antigravity / Claude / Gemini)
        if (conversation.Title == "Tối ưu CV" || conversation.Title.StartsWith("Tối ưu CV #") || conversation.Title == "Cuộc trò chuyện mới" || conversation.Title.StartsWith("Cuộc trò chuyện mới #")) {
            var smartTitle = GenerateSmartTitle(request.Content.Trim(), sectionType, request.TargetJobTitle, enhanceResult.SuggestedKeywords, enhanceResult.ConversationTitle);
            conversation.UpdateTitle(smartTitle);
        }

        var metadata = new {
            sectionType = sectionType,
            targetJobTitle = request.TargetJobTitle,
            suggestedKeywords = enhanceResult.SuggestedKeywords,
            improvements = enhanceResult.Improvements,
            conversationTitle = conversation.Title,
            isApplied = false
        };
        var metadataJson = JsonSerializer.Serialize(metadata);

        // 4. Lưu tin nhắn phản hồi của AI
        var aiMessage = AiMessage.CreateAiMessage(conversation.Id, enhanceResult.EnhancedContent, metadataJson);
        await _conversationRepository.AddMessageAsync(aiMessage, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AiMessageDto(
            aiMessage.Id,
            aiMessage.Sender,
            aiMessage.Content,
            aiMessage.MetadataJson,
            aiMessage.CreatedAt
        );
    }

    private static string GenerateSmartTitle(
        string prompt, 
        string? sectionType, 
        string? targetJobTitle, 
        IReadOnlyList<string>? keywords,
        string? aiGeneratedTitle) {

        // Ưu tiên tiêu đề do AI tự động tổng hợp theo ngữ cảnh hội thoại (phong cách Antigravity / Claude / Gemini)
        if (!string.IsNullOrWhiteSpace(aiGeneratedTitle)) {
            var cleanAiTitle = aiGeneratedTitle.Trim().Trim('"', '\'', '`', '.');
            if (cleanAiTitle.Length >= 4 && cleanAiTitle.Length <= 55) {
                return cleanAiTitle;
            }
        }

        // Nếu có TargetJobTitle và từ khóa kỹ năng cốt lõi
        if (!string.IsNullOrWhiteSpace(targetJobTitle) && keywords != null && keywords.Count > 0) {
            return $"Tối ưu {targetJobTitle.Trim()} ({keywords[0]})";
        }

        if (keywords != null && keywords.Count >= 2) {
            return $"{keywords[0]} & {keywords[1]}";
        }
        if (keywords != null && keywords.Count == 1) {
            return $"Tối ưu {keywords[0]}";
        }

        if (!string.IsNullOrWhiteSpace(targetJobTitle)) {
            return $"Tối ưu {targetJobTitle.Trim()}";
        }

        // Tự động rút gọn câu hỏi của người dùng một cách tự nhiên
        var words = prompt
            .Replace("\r", " ")
            .Replace("\n", " ")
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => !string.IsNullOrWhiteSpace(w))
            .ToArray();

        var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase) {
            "tôi", "em", "mình", "làm", "viết", "cho", "của", "tại", "ở", "và", "các", "có", "hơn", "khoảng", "trong", "hãy", "giúp"
        };
        var meaningfulWords = words.Where(w => !stopWords.Contains(w.Trim(".,;:?!()\"'".ToCharArray()))).Take(5).ToArray();
        
        string rawTitle = meaningfulWords.Length >= 2 
            ? string.Join(' ', meaningfulWords) 
            : string.Join(' ', words.Take(5));

        if (string.IsNullOrWhiteSpace(rawTitle)) return "Tối ưu CV";

        rawTitle = char.ToUpper(rawTitle[0]) + rawTitle.Substring(1);
        return rawTitle.Length > 45 ? rawTitle.Substring(0, 42) + "..." : rawTitle;
    }
}
