using SmartHire.Application.Abstractions.Ai;

namespace SmartHire.Infrastructure.Ai;

internal static class GeminiPrompts {
    public static string BuildCvEnhancePrompt(CvEnhanceRequest request) {
        var sectionHint = string.IsNullOrWhiteSpace(request.SectionType)
            ? "Tự động phân tích nội dung để xác định mục phù hợp nhất (WORK_EXPERIENCE, PROJECT, OBJECTIVE, SUMMARY hoặc SKILLS)."
            : $"Mục được chỉ định: '{request.SectionType}'.";

        var targetTitle = request.TargetJobTitle ?? "Không chỉ định cụ thể (Tự phân tích theo chuyên môn và mô tả công việc)";

        return $$"""
            Bạn là một chuyên gia tư vấn tuyển dụng cao cấp và chuyên gia tối ưu CV quốc tế.
            Nhiệm vụ: Phân tích thông tin CV, vị trí mục tiêu và nội dung được cung cấp để viết lại theo chuẩn mực chuyên nghiệp, sắc bén và TUÂN THỦ NGHIÊM NGẶT BỘ KHUNG GOOGLE XYZ.

            QUY TẮC CỐT LÕI BẮT BUỘC:
            1. BỘ KHUNG GOOGLE XYZ CHUẨN XÁC & THỰC TẾ:
               - Cấu trúc: Đạt được [X] (Accomplished), đo lường bằng [Y] (Measured by), thông qua giải pháp [Z] (by Doing).
               - Bắt đầu mỗi ý/mệnh đề bằng Action Verbs dứt khoát: Phát triển, Thiết kế, Tối ưu hóa, Xây dựng, Chuẩn hóa, Triển khai, Tái cấu trúc, Cải tiến, Điều phối, Đảm bảo.
               - Tuyệt đối TRÁNH các từ yếu/bị động: làm việc, hỗ trợ, tham gia, viết code, sửa bug, chịu trách nhiệm, responsible for, helped with, worked on.
               - Số liệu [Y] phải chân thực: Nếu đầu vào có số liệu thì chuẩn hóa và làm nổi bật; nếu không có số liệu, hãy đo lường bằng tiêu chí thực tế: độ trễ truy vấn, tính ổn định, độ bao phủ kiểm thử, giảm thiểu thao tác thủ công, mức độ hài lòng, thời gian hoàn thành đúng hạn. TUYỆT ĐỐI KHÔNG bịa đặt số liệu doanh thu triệu đô hay hàng triệu người dùng vô lý cho cấp bậc Junior/Fresher.

            2. TỰ ĐỘNG PHÂN TÍCH VỊ TRÍ, CẤP BẬC VÀ MỤC CV (Context-Aware):
               - {{sectionHint}}
               - Đối chiếu với Vị trí mục tiêu '{{targetTitle}}' và Mô tả công việc (JD) để đưa vào các từ khóa kỹ thuật/nghiệp vụ phù hợp nhất (ATS keywords).

            3. CHUẨN MỰC CHÍNH TẢ & DẤU CÂU:
               - Dấu câu chuẩn xác, câu ngắn gọn, mạch lạc (1-2 câu cho mỗi thành tựu), không viết câu ghép dài lê thê với nhiều dấu chấm phẩy (;).

            THÔNG TIN ĐẦU VÀO:
            - Vị trí mục tiêu: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Mô tả công việc mục tiêu (JD):\n\"\"\"{request.JobContext}\"\"\"\n")}}
            {{(string.IsNullOrWhiteSpace(request.CvContext) ? "" : $"- Ngữ cảnh toàn bộ CV của ứng viên:\n\"\"\"{request.CvContext}\"\"\"\n")}}
            {{(string.IsNullOrWhiteSpace(request.Content) ? "" : $"- Nội dung người dùng gửi cần tối ưu:\n\"\"\"{request.Content}\"\"\"\n")}}
            - Ngôn ngữ đầu ra: {{(request.Language == "en" ? "Tiếng Anh (English)" : "Tiếng Việt")}}

            BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU (không thêm markdown ngoài khối json):
            {
              "detectedSection": "WORK_EXPERIENCE | PROJECT | OBJECTIVE | SUMMARY | SKILLS",
              "conversationTitle": "Tiêu đề ngắn 3-6 từ tóm tắt ý định (VD: Tối ưu Kinh nghiệm Backend, Viết lại Dự án E-commerce)",
              "originalContent": "nội dung gốc hoặc đoạn trích chính từ CV",
              "enhancedContent": "nội dung đã viết lại chuẩn mực sắc bén theo công thức Google XYZ",
              "suggestedKeywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4"],
              "improvements": [
                "Google XYZ [X] - Thành tựu: ...",
                "Google XYZ [Y] - Tiêu chí đo lường: ...",
                "Google XYZ [Z] - Giải pháp/kỹ thuật: ...",
                "Phân tích Action Verbs & từ khóa tối ưu cho vị trí mục tiêu"
              ]
            }
            """;
    }

    public static string BuildCvEnhanceStreamPrompt(CvEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn phù hợp";

        return $$"""
            Bạn là chuyên gia tư vấn tối ưu CV cao cấp.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn mực Google XYZ hướng đến vị trí '{{targetTitle}}'.

            NGUYÊN TẮC BẮT BUỘC:
            1. Áp dụng chuẩn Google XYZ: Đạt được [X], đo lường bằng [Y] (tính ổn định, độ trễ, thời gian, sự hài lòng hoặc chỉ số thực tế), thông qua giải pháp [Z].
            2. Bắt đầu bằng Động từ hành động mạnh (Action Verbs: Phát triển, Thiết kế, Tối ưu hóa, Chuẩn hóa, Triển khai, Đảm bảo...). Không dùng từ yếu/bị động.
            3. Bám sát vị trí mục tiêu '{{targetTitle}}' và ngữ cảnh công việc được cung cấp.
            4. Trình bày ngắn gọn, mạch lạc, dấu câu chuẩn xác, ngắt nhịp tự nhiên.
            5. Ngôn ngữ: {{(request.Language == "en" ? "Tiếng Anh" : "Tiếng Việt")}}.
            6. CHỈ TRẢ VỀ TRỰC TIẾP ĐOẠN VĂN / BULLET POINTS ĐÃ TỐI ƯU. Không thêm lời chào, không giải thích, không dùng markdown code block:

            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"Yêu cầu công việc (JD):\n\"\"\"{request.JobContext}\"\"\"\n")}}
            {{(string.IsNullOrWhiteSpace(request.CvContext) ? "" : $"Hồ sơ CV của ứng viên:\n\"\"\"{request.CvContext}\"\"\"\n")}}
            Nội dung cần tối ưu:
            "{{request.Content ?? request.CvContext}}"
            """;
    }

    public static CvEnhanceResult CreateFallbackEnhancement(CvEnhanceRequest request) {
        var isEn = string.Equals(request.Language, "en", StringComparison.OrdinalIgnoreCase);
        var original = request.Content ?? request.CvContext ?? (isEn ? "CV Content" : "Nội dung CV");
        var enhanced = isEn
            ? "AI service is currently busy, please try again later!"
            : "Dịch vụ AI đang bận, vui lòng thử lại sau!";

        return new CvEnhanceResult(
            OriginalContent: original,
            EnhancedContent: enhanced,
            SuggestedKeywords: Array.Empty<string>(),
            Improvements: isEn
                ? new[] { "AI service is temporarily unavailable or busy. Original content has been preserved." }
                : new[] { "Dịch vụ AI đang bận hoặc gián đoạn kết nối. Nội dung CV gốc được bảo toàn nguyên vẹn." },
            DetectedSection: request.SectionType ?? "WORK_EXPERIENCE",
            ConversationTitle: isEn ? "CV Optimization" : "Tối ưu CV"
        );
    }

    public static string BuildMatchAnalysisPrompt(string cvText, string jobText, decimal score) {
        return $$"""
            Bạn là hệ thống AI phân tích tuyển dụng thông minh chuẩn quốc tế.
            Điểm tương đồng tính toán giữa CV và JD đã được xác định là: {{score:F2}}%.
            Nhiệm vụ: Phân tích chi tiết sự phù hợp giữa CV và JD dưới đây và trả về định dạng JSON nghiêm ngặt.
            
            CV ỨNG VIÊN:
            \"\"\"{{cvText}}\"\"\"

            MÔ TẢ CÔNG VIỆC (JD):
            \"\"\"{{jobText}}\"\"\"

            Bắt buộc trả về đúng định dạng JSON:
            {
              "summary": "Tóm tắt ngắn gọn độ phù hợp của ứng viên với yêu cầu vị trí.",
              "matchingSkills": ["kỹ năng khớp 1", "kỹ năng khớp 2"],
              "missingSkills": ["kỹ năng còn thiếu 1", "kỹ năng còn thiếu 2"],
              "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
              "recommendations": ["lời khuyên nâng cao cạnh tranh 1", "lời khuyên 2"]
            }
            """;
    }

    public static MatchAnalysisResult CreateFallbackMatchAnalysis(decimal score) {
        return new MatchAnalysisResult(
            Score: score,
            Summary: $"Hồ sơ ứng viên có độ tương thích {score:F2}% với vị trí tuyển dụng.",
            MatchingSkills: new[] { "Kỹ năng chuyên môn", "Kinh nghiệm thực tế" },
            MissingSkills: new[] { "Kỹ năng chuyên sâu bổ sung" },
            Strengths: new[] { "Kinh nghiệm phù hợp với định hướng công việc." },
            Recommendations: new[] { "Bổ sung thêm các dự án thực tế và chứng chỉ liên quan." }
        );
    }
}
