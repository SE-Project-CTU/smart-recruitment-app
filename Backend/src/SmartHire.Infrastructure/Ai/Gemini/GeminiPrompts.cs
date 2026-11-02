using System.Text.Json;
using SmartHire.Application.Abstractions.Ai;

namespace SmartHire.Infrastructure.Ai;

internal static class GeminiPrompts {
    private const string GoldStandardFewShotExamples = """
        [VÍ DỤ MẪU VÀNG CHUẨN MỰC - FEW-SHOT GOLD STANDARDS]
        - MỤC TIÊU NGHỀ NGHIỆP (OBJECTIVE):
          + Gốc: "Lập trình viên 2 năm kinh nghiệm ReactJS, muốn ứng tuyển Senior Fullstack để học thêm backend .NET."
          + Chuẩn vàng XYZ: "Định hướng phát triển thành Senior Fullstack Engineer bằng việc phát huy 2 năm kinh nghiệm xây dựng giao diện web ReactJS, kết hợp nghiên cứu chuyên sâu kiến trúc backend C# .NET và microservices nhằm đảm bảo tính ổn định và mở rộng của hệ thống."

        - KINH NGHIỆM LÀM VIỆC (EXPERIENCE):
          + Gốc: "Cắt giao diện theo Figma bằng HTML, CSS, ReactJS, kết nối API và sửa lỗi theo yêu cầu."
          + Chuẩn vàng XYZ: "Phát triển các module giao diện người dùng bằng ReactJS và Redux Toolkit tuân thủ đặc tả Figma, tối ưu hóa luồng gọi RESTful API nhằm hạn chế số lần re-render và chủ động phối hợp cùng nhóm kiểm thử để duy trì chất lượng mã nguồn ổn định."

        - DỰ ÁN TIÊU BIỂU (PROJECTS):
          + Gốc: "Làm website thương mại điện tử có giỏ hàng, thanh toán và quản lý đơn hàng."
          + Chuẩn vàng XYZ: "Xây dựng hệ thống thương mại điện tử tích hợp cổng thanh toán trực tuyến, chuẩn hóa schema cơ sở dữ liệu PostgreSQL và triển khai container hóa với Docker nhằm bảo đảm tính toàn vẹn và bảo mật dữ liệu giao dịch."

        - GIẢI THƯỞNG & THÀNH TÍCH (AWARDS):
          + Gốc: "Đạt giải Nhất cuộc thi Sáng tạo công nghệ sinh viên 2024."
          + Chuẩn vàng XYZ: "Đạt Giải Nhất cuộc thi Sáng tạo Công nghệ Sinh viên 2024 nhờ đề tài ứng dụng AI tự động hóa quy trình, vượt qua hơn 150 đội thi tranh tài cấp toàn quốc."
        """;

    public static string BuildCvEnhancePrompt(CvEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn Google XYZ hướng đến vị trí '{{targetTitle}}'.

            {{GoldStandardFewShotExamples}}

            NGUYÊN TẮC CỐT LÕI (SLIM & SHARP):
            1. Bắt đầu bằng Động từ hành động thực chiến (Phát triển, Thiết kế, Tối ưu hóa, Chuẩn hóa, Triển khai, Tích hợp).
            2. Tuyệt đối không tự bịa số % hoặc số liệu cụ thể nếu nội dung gốc không có. Thay vào đó, đo lường bằng giá trị thực tế: tính sẵn sàng cao, bảo đảm dữ liệu toàn vẹn, tối ưu hóa thời gian phản hồi, tuân thủ kiến trúc chuẩn.
            3. Câu văn gãy gọn (1-2 câu), giọng văn khiêm tốn, trung thực, chuyên nghiệp, không dùng từ sáo rỗng (như "đóng vai trò then chốt", "hiệu năng vượt trội").
            4. BẮT BUỘC 100% giữ nguyên ngôn ngữ gốc của nội dung người dùng (Nếu gốc là Tiếng Việt -> Xuất 100% Tiếng Việt, cấm tự ý dịch tiếng Anh).

            THÔNG TIN ĐẦU VÀO:
            - Vị trí mục tiêu: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Yêu cầu cốt lõi (JD chắt lọc):\n{request.JobContext}\n")}}
            - Nội dung cần viết lại:
            "{{request.Content}}"

            TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON (không kèm markdown bên ngoài):
            {
              "detectedSection": "{{request.SectionType ?? "EXPERIENCE"}}",
              "enhancedContent": "Nội dung đã viết lại chuẩn xác theo mẫu vàng",
              "suggestedKeywords": ["từ khóa 1", "từ khóa 2"],
              "improvements": [
                "Chuẩn Google XYZ: Accomplished [X], measured by [Y], by doing [Z]",
                "Động từ hành động thực chiến & bám sát Target Job"
              ]
            }
            """;
    }

    public static string BuildCvBatchEnhancePrompt(CvBatchEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
        var sectionsJson = JsonSerializer.Serialize(request.Sections.Select(s => new {
            sectionType = s.SectionType,
            content = s.Content
        }));

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao.
            Nhiệm vụ: Tối ưu hóa đồng thời TẤT CẢ các mục CV dưới đây theo chuẩn Google XYZ hướng đến vị trí '{{targetTitle}}' trong duy nhất một lần xử lý.

            {{GoldStandardFewShotExamples}}

            NGUYÊN TẮC CỐT LÕI:
            1. Tối ưu từng mục tương ứng theo cấu trúc Google XYZ: Action Verb + Kỹ thuật/Nhiệm vụ cụ thể + Ý nghĩa định tính/định lượng chân thực.
            2. Không tự bịa đặt số % nếu nội dung gốc không có số.
            3. Giữ nguyên 100% ngôn ngữ gốc của từng mục (Tiếng Việt -> Xuất Tiếng Việt).
            4. Viết súc tích, mạch lạc (1-2 câu mỗi mục), tránh từ hoa mỹ.

            NGỮ CẢNH VỊ TRÍ:
            - Vị trí: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Yêu cầu tuyển dụng (Chắt lọc):\n{request.JobContext}\n")}}

            DANH SÁCH MỤC CV CẦN TỐI ƯU (JSON):
            {{sectionsJson}}

            BẮT BUỘC TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON SAU (không có văn bản thừa):
            {
              "sections": [
                {
                  "sectionType": "TÊN_MỤC",
                  "enhancedContent": "Nội dung viết lại chuẩn mực",
                  "suggestedKeywords": ["từ khóa chính"],
                  "improvements": ["Điểm cải thiện Google XYZ"]
                }
              ]
            }
            """;
    }

    public static string BuildCvEnhanceStreamPrompt(CvEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";

        return $$"""
            Bạn là chuyên gia tư vấn tối ưu CV chuyên nghiệp.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn Google XYZ hướng đến vị trí '{{targetTitle}}'.

            {{GoldStandardFewShotExamples}}

            NGUYÊN TẮC:
            1. Bắt đầu bằng Action Verb (Phát triển, Thiết kế, Tối ưu hóa, Chuẩn hóa, Triển khai, Đảm bảo...).
            2. Không bịa đặt số % nếu gốc không có. Đo lường bằng tính sẵn sàng, toàn vẹn dữ liệu, hiệu năng truy vấn.
            3. Viết 1-2 câu gãy gọn, đúng chính tả, giọng văn khiêm tốn thực chiến.
            4. BẮT BUỘC 100% giữ nguyên ngôn ngữ gốc (Gốc Tiếng Việt -> Xuất Tiếng Việt).
            5. CHỈ TRẢ VỀ DUY NHẤT NỘI DUNG ĐÃ VIẾT LẠI (Không lời chào, không giải thích):

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
            DetectedSection: request.SectionType ?? "EXPERIENCE",
            ConversationTitle: isEn ? "CV Optimization" : "Tối ưu CV"
        );
    }

    public static CvBatchEnhanceResult CreateFallbackBatchEnhancement(CvBatchEnhanceRequest request) {
        var results = request.Sections.Select(s => new CvSectionEnhancedResult(
            SectionType: s.SectionType,
            OriginalContent: s.Content,
            EnhancedContent: s.Content,
            SuggestedKeywords: new[] { s.SectionType },
            Improvements: new[] { "Bảo toàn nội dung gốc do dịch vụ AI đang bận." }
        )).ToList();

        return new CvBatchEnhanceResult(results);
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
