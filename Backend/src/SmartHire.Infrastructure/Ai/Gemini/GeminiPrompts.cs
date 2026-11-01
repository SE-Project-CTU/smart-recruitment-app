using SmartHire.Application.Abstractions.Ai;

namespace SmartHire.Infrastructure.Ai;

internal static class GeminiPrompts {
    public static string BuildCvEnhancePrompt(CvEnhanceRequest request) {
        var sectionHint = string.IsNullOrWhiteSpace(request.SectionType)
            ? "Tự động phân tích nội dung để xác định mục phù hợp nhất (EXPERIENCE, PROJECTS, SKILLS, EDUCATION, OBJECTIVE, CERTIFICATIONS, AWARDS)."
            : $"Mục được chỉ định: '{request.SectionType}'.";

        var targetTitle = request.TargetJobTitle ?? "Không chỉ định cụ thể (Tự phân tích theo chuyên môn và mô tả công việc)";

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cao cấp và tối ưu CV chuyên nghiệp.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn mực Google XYZ, phù hợp chính xác với vị trí mục tiêu '{{targetTitle}}'.

            QUY TẮC CỐT LÕI BẮT BUỘC:
            1. TIẾT CHẾ SỐ LIỆU TUYỆT ĐỐI (CẤM TỰ BỊA ĐẶT SỐ LIỆU HOẶC % ẢO):
               - NGUYÊN TẮC BẤT DI BẤT DỊCH: CHỈ giữ lại và làm nổi bật con số, tỷ lệ % NẾU người dùng đã tự cung cấp trong nội dung gốc.
               - CẤM TUYỆT ĐỐI: Không tự ý chèn ký tự '%' hoặc bịa đặt bất kỳ con số cụ thể nào (như '30%', '25%', '50%', 'độ trễ 200ms', '99.9%') nếu trong nội dung gốc KHÔNG CÓ con số đó. Nếu vi phạm bịa số %, kết quả bị coi là vi phạm nghiêm trọng tính trung thực của CV.
               - KHI NỘI DUNG GỐC KHÔNG CÓ SỐ LIỆU: Thành phần đo lường [Y] BẮT BUỘC phải đo lường bằng GIÁ TRỊ THỰC TẾ & TÍNH CHẤT ĐỊNH TÍNH CHÂN THỰC:
                 + Đảm bảo tính sẵn sàng, độ tin cậy và sự thông suốt trong vận hành dịch vụ.
                 + Bảo đảm tính toàn vẹn và độ chính xác của cơ sở dữ liệu.
                 + Chuẩn hóa và tối ưu hóa thời gian xử lý truy vấn, hạn chế lỗi phát sinh trong luồng nghiệp vụ.
                 + Tuân thủ kiến trúc chuẩn mực (Clean Architecture, Microservices patterns), tiêu chuẩn mã nguồn sạch và bảo mật API.
                 + Đảm bảo tiến độ bàn giao tính năng và đáp ứng chính xác đặc tả yêu cầu nghiệp vụ.

            2. TIẾT CHẾ PHONG VĂN & ĐỐI CHIẾU SÁT VỚI TARGET JOB '{{targetTitle}}':
               - Giọng văn khiêm tốn, khách quan, súc tích, gãy gọn; tuyệt đối tránh đao to búa lớn, không dùng tính từ hoa mỹ, không phóng đại quy mô vượt quá ngữ cảnh.
               - Bám sát yêu cầu chuyên môn, công nghệ chủ chốt của vị trí '{{targetTitle}}' (dựa theo JD nếu có). Không chèn các công nghệ hay thuật ngữ lạc đề ngoài phạm vi chuyên môn của vị trí này.
               - Cân nhắc cấp bậc (Junior / Mid / Senior): Với Senior, nhấn mạnh năng lực thiết kế giải pháp kỹ thuật, tính tin cậy của hệ thống, chuẩn hóa quy trình và tính tái sử dụng; không thổi phồng thành các thành tích siêu thực.

            3. VÍ DỤ ĐỐI CHIẾU TIÊU BIỂU (KHI NỘI DUNG GỐC KHÔNG CÓ SỐ):
               - ĐẦU VÀO GỐC: "Tôi có 3 năm lập trình backend C# .NET và cơ sở dữ liệu PostgreSQL. Thiết kế tối ưu hệ thống microservices và tích hợp vector embedding tìm kiếm."
               - SAI (Bịa số ảo): "...giảm 30% độ trễ truy vấn và tăng 25% độ ổn định..." -> LỖI NGHIÊM TRỌNG vì tự bịa 30% và 25%.
               - ĐÚNG (Tiết chế, đo lường định tính chuẩn mực, bám sát Senior Backend): "Thiết kế và phát triển các dịch vụ backend RESTful API bằng C# .NET kết hợp cơ sở dữ liệu PostgreSQL, đảm bảo tính sẵn sàng cao và khả năng mở rộng của kiến trúc microservices, thông qua việc chuẩn hóa schema cơ sở dữ liệu, tối ưu hóa câu lệnh truy vấn và tích hợp vector embedding phục vụ tính năng tìm kiếm ngữ nghĩa."

            4. CẤU TRÚC GOOGLE XYZ TINH TẾ:
               - Accomplished [X], as measured by [Y], by doing [Z] (Đạt được [X], đo lường bằng [Y], thông qua giải pháp [Z]).
               - Bắt đầu bằng Động từ hành động (Action Verbs) vừa vặn: Phát triển, Thiết kế, Tối ưu hóa, Chuẩn hóa, Triển khai, Cải tiến, Đảm bảo, Tích hợp.
               - Tránh các từ yếu: làm việc, hỗ trợ, tham gia, viết code, sửa bug, chịu trách nhiệm.

            5. DẤU CÂU & CHÍNH TẢ:
               - Viết câu ngắn gọn (1-2 câu súc tích), dấu câu chuẩn xác, ngắt nhịp nhịp nhàng, không viết câu ghép dài lê thê.

            6. QUY TẮC BẮT BUỘC VỀ NGÔN NGỮ ĐẦU RA (LANGUAGE RESOLUTION):
               - QUY TẮC TỐI CAO: BẮT BUỘC 100% giữ nguyên ngôn ngữ của NỘI DUNG GỐC CẦN TỐI ƯU.
                 + Nếu nội dung người dùng gửi vào là TIẾNG VIỆT -> BẮT BUỘC PHẢI VIẾT LẠI HOÀN TOÀN BẰNG TIẾNG VIỆT! TUYỆT ĐỐI CẤM TỰ Ý DỊCH SANG TIẾNG ANH (kể cả khi tên vị trí tuyển dụng hoặc JD viết bằng tiếng Anh).
                 + Nếu nội dung người dùng gửi vào là TIẾNG ANH -> Viết lại bằng TIẾNG ANH.
                 + CHỈ ĐƯỢC PHÉP chuyển sang tiếng Anh khi trong nội dung người dùng CÓ YÊU CẦU RÕ RÀNG như: "viết bằng tiếng Anh", "dịch sang tiếng Anh", "write in English", "translate to English".
               - Khi Ngôn ngữ mục tiêu chỉ định 'vi': Bắt buộc 100% Tiếng Việt.
               - Khi Ngôn ngữ mục tiêu chỉ định 'en': Bắt buộc 100% Tiếng Anh.

            THÔNG TIN ĐẦU VÀO:
            - Vị trí mục tiêu: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Mô tả công việc mục tiêu (JD):\n\"\"\"{request.JobContext}\"\"\"\n")}}
            {{(string.IsNullOrWhiteSpace(request.CvContext) ? "" : $"- Ngữ cảnh CV ứng viên:\n\"\"\"{request.CvContext}\"\"\"\n")}}
            {{(string.IsNullOrWhiteSpace(request.Content) ? "" : $"- Nội dung người dùng gửi cần tối ưu:\n\"\"\"{request.Content}\"\"\"\n")}}
            - Ngôn ngữ đầu ra dự kiến: {{(request.Language == "en" ? "Tiếng Anh (English)" : (request.Language == "vi" ? "Tiếng Việt" : "Tự động phân giải (Ưu tiên Tiếng Anh nếu CV tiếng Anh, hoặc theo lệnh của người dùng)"))}}

            BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON TINH GỌN SAU (không thêm markdown ngoài khối json, trả lời ngắn gọn để tối ưu tốc độ):
            {
              "detectedSection": "EXPERIENCE | PROJECTS | SKILLS | EDUCATION | OBJECTIVE | CERTIFICATIONS | AWARDS",
              "enhancedContent": "nội dung đã viết lại chuẩn mực, chân thực, tiết chế số liệu theo Google XYZ",
              "suggestedKeywords": ["từ khóa 1", "từ khóa 2"],
              "improvements": [
                "Chuẩn Google XYZ: Accomplished [X], measured by [Y], by doing [Z]",
                "Động từ hành động & bám sát Target Job"
              ]
            }
            """;
    }

    public static string BuildCvEnhanceStreamPrompt(CvEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn phù hợp";

        return $$"""
            Bạn là chuyên gia tư vấn tối ưu CV chuyên nghiệp.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn mực Google XYZ hướng đến vị trí '{{targetTitle}}'.

            NGUYÊN TẮC BẮT BUỘC:
            1. TIẾT CHẾ SỐ LIỆU TUYỆT ĐỐI (CẤM TỰ BỊA ĐẶT SỐ LIỆU HOẶC % ẢO):
               - NGUYÊN TẮC BẤT DI BẤT DỊCH: CHỈ giữ lại số liệu/tỷ lệ % NẾU người dùng tự cung cấp trong nội dung gốc.
               - CẤM TUYỆT ĐỐI: Không tự ý dùng ký tự '%' hoặc bịa số liệu đo lường cụ thể (như 30%, 25%, 50%, 200ms) nếu người dùng không cung cấp số liệu trong văn bản gốc.
               - Đo lường thành phần [Y] bằng các tiêu chí giá trị thực tế và định tính chân thực: tính sẵn sàng cao, sự thông suốt và độ tin cậy của dịch vụ, dữ liệu toàn vẹn, tối ưu hóa thời gian xử lý truy vấn, hạn chế lỗi phát sinh, tuân thủ chuẩn thiết kế và hoàn thành đúng tiến độ.
            2. VỪA VẶN VỚI VỊ TRÍ MỤC TIÊU '{{targetTitle}}':
               - Tiết chế giọng văn khiêm tốn, tự nhiên, đúng cấp bậc thực tế, không đao to búa lớn, không thổi phồng quy mô.
               - Bám sát yêu cầu công nghệ và chuyên môn của vị trí '{{targetTitle}}' và JD. Không lan man sang công nghệ không liên quan.
            3. Áp dụng chuẩn Google XYZ: Đạt được [X], đo lường bằng [Y], thông qua giải pháp [Z]. Bắt đầu bằng Action Verbs chuẩn mực (Phát triển, Thiết kế, Tối ưu hóa, Chuẩn hóa, Triển khai, Đảm bảo...).
            4. Viết 1-2 câu súc tích, mạch lạc, dấu câu chuẩn xác đúng chính tả, ngắt nhịp tự nhiên.
            5. QUY TẮC BẮT BUỘC VỀ NGÔN NGỮ ĐẦU RA (LANGUAGE RESOLUTION):
               - QUY TẮC TỐI CAO: BẮT BUỘC 100% xuất ra bằng ĐÚNG NGÔN NGỮ của 'Nội dung cần tối ưu'.
                 + Nếu nội dung cần tối ưu là TIẾNG VIỆT -> BẮT BUỘC 100% viết lại bằng TIẾNG VIỆT! TUYỆT ĐỐI CẤM TỰ Ý XUẤT TIẾNG ANH (dù tên vị trí tuyển dụng có tiếng Anh như .NET, React, Backend).
                 + Nếu nội dung cần tối ưu là TIẾNG ANH -> Viết lại bằng TIẾNG ANH.
                 + CHỈ ĐƯỢC PHÉP xuất Tiếng Anh khi người dùng CÓ LỆNH RÕ RÀNG như: "viết bằng tiếng Anh", "dịch sang tiếng Anh", "write in English", "translate to English".
               - Ngôn ngữ dự kiến: {{(request.Language == "vi" ? "Tiếng Việt (Bắt buộc)" : (request.Language == "en" ? "Tiếng Anh (Bắt buộc)" : "Theo ngôn ngữ của nội dung cần tối ưu"))}}.
            6. CHỈ TRẢ VỀ TRỰC TIẾP ĐOẠN VĂN / CÁC BULLET POINTS ĐÃ VIẾT LẠI (HOÀN TOÀN BẰNG NGÔN NGỮ ĐÃ ĐƯỢC XÁC ĐỊNH Ở MỤC 5). Không thêm lời chào, không giải thích, không dùng markdown code block:

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
            DetectedSection: request.SectionType ?? "EXPERIENCE",
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
