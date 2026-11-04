using System.Text.Json;
using SmartHire.Application.Abstractions.Ai;

namespace SmartHire.Infrastructure.Ai;

internal static class GeminiPrompts {
    private const string GoldStandardFewShotExamples = """
        [MẪU VÀNG GOOGLE XYZ ĐA NGÀNH - BẢO TOÀN CẤU TRÚC & SỐ LƯỢNG GẠCH ĐẦU DÒNG]
        Ví dụ 1: Mục có nhiều gạch đầu dòng (BẮT BUỘC GIỮ ĐÚNG SỐ LƯỢNG GẠCH ĐẦU DÒNG, TUYỆT ĐỐI KHÔNG GỘP THÀNH 1 ĐOẠN):
        - Gốc:
          - Thực hiện cắt giao diện web HTML/CSS từ bản vẽ thiết kế Figma.
          - Xây dựng các component hiển thị danh sách sản phẩm bằng ReactJS và kết nối API.
          - Phối hợp với tester để kiểm thử và sửa lỗi giao diện.
        - Chuẩn XYZ (Giữ nguyên đúng 3 gạch đầu dòng riêng biệt, mỗi ý 1 dòng):
          - Phát triển giao diện web responsive chuẩn pixel-perfect từ thiết kế Figma bằng HTML5/CSS3 và Tailwind CSS, tối ưu trải nghiệm đa thiết bị.
          - Xây dựng các module giao diện bằng ReactJS và tích hợp RESTful API với cơ chế xử lý lỗi, giúp giảm 30% thời gian phản hồi giao diện.
          - Phối hợp chặt chẽ cùng đội ngũ QA/QC kiểm thử và xử lý triệt để các lỗi giao diện, đảm bảo chất lượng phát hành đúng tiến độ.

        Ví dụ 2: Mục tiêu nghề nghiệp (Đoạn văn đơn, không có gạch đầu dòng -> Giữ nguyên đoạn văn đơn, không chèn '-'):
        - Gốc: "Lập trình viên Frontend 2 năm kinh nghiệm, mong muốn ứng tuyển Fullstack .NET và React để học hỏi hệ thống lớn."
        - Chuẩn XYZ: "Kỹ sư Frontend với 2 năm kinh nghiệm thực chiến phát triển ứng dụng web ReactJS, mong muốn ứng tuyển vị trí Fullstack Web Engineer để phát huy năng lực xây dựng giao diện tối ưu đồng thời mở rộng chuyên môn kiến trúc backend C# .NET và microservices hiệu năng cao."
        """;

    private static string ResolveLanguageInstruction(string? language) {
        if (string.Equals(language, "en", StringComparison.OrdinalIgnoreCase)) {
            return "NGÔN NGỮ ĐẦU RA: BẮT BUỘC 100% TIẾNG ANH (ENGLISH). Sử dụng văn phong chuyên nghiệp, chuẩn mực bản ngữ.";
        }
        if (string.Equals(language, "vi", StringComparison.OrdinalIgnoreCase)) {
            return "NGÔN NGỮ ĐẦU RA: BẮT BUỘC 100% TIẾNG VIỆT. Hành văn tự nhiên, gãy gọn, chuẩn tiếng Việt công sở.";
        }
        return "NGÔN NGỮ ĐẦU RA: Giữ nguyên 100% ngôn ngữ gốc của văn bản đầu vào (Gốc Tiếng Anh -> Xuất Tiếng Anh; Gốc Tiếng Việt -> Xuất Tiếng Việt).";
    }

    public static string BuildSkillsEnhancePrompt(CvEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
        var langInstruction = ResolveLanguageInstruction(request.Language);

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao và tối ưu CV chuyên nghiệp.
            Nhiệm vụ: Phân tích mục KỸ NĂNG CHUYÊN MÔN (SKILLS) của ứng viên, đối chiếu với yêu cầu công việc '{{targetTitle}}' để đưa ra GỢI Ý BỔ SUNG KỸ NĂNG CÓ CHỌN LỌC.

            QUY TẮC CỐT LÕI (FORMAT & CẤU TRÚC TIPTAP / CV):
            1. KHÔNG VIẾT THEO CÂU VĂN GOOGLE XYZ. Đây là danh mục kỹ năng, không phải mô tả kinh nghiệm.
            2. PHÂN TÍCH VÀ BẢO TỒN NGUYÊN VẸN 100% CẤU TRÚC VÀ FORMAT HIỆN TẠI CỦA CV:
               - Định dạng phân nhóm (Inline Category): Tên nhóm in đậm (vd: **Languages & Frameworks:** hoặc **Frontend:**) kèm danh sách phân cách bằng dấu phẩy.
               - Định dạng gạch đầu dòng (Bullet List): Dùng dấu chấm tròn '• ' hoặc gạch đầu dòng '- '.
               - Thẻ / Tags hoặc phân nhóm theo từng chuyên môn.
            3. NGUYÊN TẮC GỢI Ý KỸ NĂNG THỰC TẾ & TRUNG THỰC:
               - BẢO LƯU TOÀN BỘ kỹ năng hiện có của ứng viên (tuyệt đối không xóa bỏ bất kỳ kỹ năng nào).
               - ĐỐI CHIẾU VỚI JD: Nhận diện các kỹ năng cốt lõi, công cụ, công nghệ quan trọng trong JD mà CV đang thiếu.
               - BỔ SUNG GỢI Ý ĐÚNG THEO ĐỊNH DẠNG: Đưa các kỹ năng gợi ý vào đúng nhóm chuyên môn tương ứng theo phong cách định dạng y hệt của ứng viên.
               - ĐÁNH DẤU RÕ RÀNG KỸ NĂNG GỢI Ý MỚI: Đặt trong ngoặc vuông kèm ký hiệu gợi ý (ví dụ: **[Gợi ý theo JD: TênKỹNăng]**) để ứng viên phân biệt được kỹ năng gốc và kỹ năng gợi ý tham khảo, chỉ tự bổ sung nếu bản thân thực sự có kiến thức/kinh nghiệm thực tế.
            4. {{langInstruction}}

            THÔNG TIN ĐẦU VÀO:
            - Vị trí mục tiêu: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Yêu cầu cốt lõi (JD chắt lọc):\n{request.JobContext}\n")}}
            - Nội dung Kỹ năng chuyên môn hiện tại:
            "{{request.Content}}"

            TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON (không kèm markdown bên ngoài):
            {
              "detectedSection": "SKILLS",
              "enhancedContent": "Nội dung kỹ năng đã giữ nguyên định dạng của ứng viên và bổ sung gợi ý kỹ năng bám sát JD",
              "suggestedKeywords": ["kỹ năng gợi ý 1", "kỹ năng gợi ý 2"],
              "improvements": [
                "Bảo toàn nguyên vẹn format cấu trúc (bullet/chữ đậm/phân nhóm) của CV gốc",
                "Gợi ý bổ sung kỹ năng trọng tâm theo JD để ứng viên tự cân nhắc và chọn lọc"
              ]
            }
            """;
    }

    public static string BuildTargetJobEnhancePrompt(CvEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
        var langInstruction = ResolveLanguageInstruction(request.Language);

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao và định vị chức danh nghề nghiệp chuyên nghiệp.
            Nhiệm vụ: Phân tích vị trí ứng tuyển / chức danh hiện tại trên CV của ứng viên và đối chiếu với vị trí tuyển dụng '{{targetTitle}}' để GỢI Ý CHỨC DANH / VỊ TRÍ ỨNG TUYỂN MỤC TIÊU (TARGET JOB) chuẩn xác, chuyên nghiệp nhất.

            QUY TẮC CỐT LÕI (TUYỆT ĐỐI TUÂN THỦ):
            1. DỰA TRỰC TIẾP VÀO YÊU CẦU CỦA VỊ TRÍ TUYỂN DỤNG ĐỂ GỢI Ý:
               - Tên chức danh nghề nghiệp ngắn gọn, súc tích, phản ánh đúng chuyên môn và cấp bậc phù hợp với Job (ví dụ: Senior Backend .NET Engineer, Frontend Developer, Performance Marketing Lead, Kế toán trưởng...).
            2. TUYỆT ĐỐI KHÔNG SỬ DỤNG DẤU MỞ NGOẶC ĐÓNG NGOẶC '()' HAY '[]' (Không viết kiểu "Frontend Developer (React / Web Developer)", "Lập trình viên (Senior .NET)...").
            3. TUYỆT ĐỐI KHÔNG DÙNG CÁC TỪ NGỮ ĐỊNH HƯỚNG HAY MỤC TIÊU NHƯ: "định hướng", "mong muốn", "hướng đến", "mục tiêu", "seeking", "aspiring"... Cứ viết thẳng tên chức danh nghề nghiệp chuẩn mực.
            4. Chỉ trả về một dòng chức danh duy nhất (từ 2 đến 7 từ).
            5. {{langInstruction}}

            THÔNG TIN ĐẦU VÀO:
            - Vị trí mục tiêu từ JD: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Yêu cầu cốt lõi (JD chắt lọc):\n{request.JobContext}\n")}}
            - Chức danh / Vị trí hiện tại trên CV:
            "{{request.Content}}"

            TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON (không kèm markdown bên ngoài):
            {
              "detectedSection": "TARGET_JOB",
              "enhancedContent": "Tên chức danh nghề nghiệp chuẩn xác, không mở ngoặc đóng ngoặc, không từ định hướng",
              "suggestedKeywords": ["từ khóa 1", "từ khóa 2"],
              "improvements": [
                "Chuẩn hóa chức danh bám sát vị trí tuyển dụng",
                "Không sử dụng dấu mở ngoặc đóng ngoặc hay cụm từ định hướng"
              ]
            }
            """;
    }

    public static string BuildCvEnhancePrompt(CvEnhanceRequest request) {
        if (string.Equals(request.SectionType, "TARGET_JOB", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.SectionType, "TITLE", StringComparison.OrdinalIgnoreCase)) {
            return BuildTargetJobEnhancePrompt(request);
        }

        if (string.Equals(request.SectionType, "SKILLS", StringComparison.OrdinalIgnoreCase)) {
            return BuildSkillsEnhancePrompt(request);
        }

        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
        var langInstruction = ResolveLanguageInstruction(request.Language);

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao đa ngành nghề.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn quốc tế Google XYZ hướng đến vị trí '{{targetTitle}}'.

            {{GoldStandardFewShotExamples}}

            NGUYÊN TẮC CỐT LÕI (SLIM & SHARP):
            1. BẢO TOÀN CẤU TRÚC VÀ SỐ LƯỢNG GẠCH ĐẦU DÒNG (BẮT BUỘC):
               - Nếu nội dung gốc có bao nhiêu gạch đầu dòng (bullet point '•', '-', '*') hoặc bao nhiêu ý, BẮT BUỘC giữ nguyên bấy nhiêu gạch đầu dòng tương ứng.
               - TUYỆT ĐỐI KHÔNG GỘP, KHÔNG GOM CÁC GẠCH ĐẦU DÒNG THÀNH 1 ĐOẠN VĂN HAY CÂU NÓI LIÊN TIẾP NHAU. Mỗi gạch đầu dòng là một ý độc lập và phải xuống dòng rõ ràng.
               - Nếu nội dung gốc là một đoạn văn đơn (như Mục tiêu nghề nghiệp / Objective), hãy giữ nguyên là MỘT đoạn văn ngắn gọn, súc tích (1-2 câu), TUYỆT ĐỐI KHÔNG tự chèn thêm gạch đầu dòng '-'.
            2. Cấu trúc Google XYZ cho từng ý: Accomplished [X] (Nhiệm vụ/Thành tựu), measured by [Y] (Thước đo/Giá trị thực tế), by doing [Z] (Phương pháp/Công cụ/Kỹ năng chuyên môn).
            3. Bắt đầu mỗi ý/gạch đầu dòng bằng Động từ hành động mạnh mẽ phù hợp với ngành nghề (Phát triển, Thiết kế, Tối ưu hóa, Điều phối, Giảng dạy, Phân tích, Vận hành, Hoạch định / Delivered, Optimized, Directed...).
            4. Tuyệt đối không tự bịa đặt số liệu cụ thể hoặc % nếu nội dung gốc không có. Đo lường bằng giá trị nghiệp vụ thực tế.
            5. Bám sát yêu cầu JD: Nếu có 'Yêu cầu cốt lõi (JD)', lồng ghép các từ khóa chuyên môn then chốt của JD vào câu văn một cách tự nhiên và chính xác để tối ưu điểm số ATS.
            6. {{langInstruction}}

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
                "Cấu trúc Google XYZ: Action Verb + Scope + Tangible Business Outcome",
                "Bám sát chuyên môn vị trí mục tiêu"
              ]
            }
            """;
    }

    public static string BuildCvBatchEnhancePrompt(CvBatchEnhanceRequest request) {
        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
        var langInstruction = ResolveLanguageInstruction(request.Language);
        var sectionsJson = JsonSerializer.Serialize(request.Sections.Select(s => new {
            sectionType = s.SectionType,
            content = s.Content
        }));

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao đa ngành nghề.
            Nhiệm vụ: Tối ưu hóa đồng thời TẤT CẢ các mục CV dưới đây theo chuẩn Google XYZ hướng đến vị trí '{{targetTitle}}' trong duy nhất một lần xử lý.

            {{GoldStandardFewShotExamples}}

            NGUYÊN TẮC CỐT LÕI:
            1. BẢO TOÀN CẤU TRÚC VÀ SỐ LƯỢNG GẠCH ĐẦU DÒNG (BẮT BUỘC):
               - Mỗi mục có bao nhiêu gạch đầu dòng (bullet points '•', '-') thì giữ nguyên bấy nhiêu gạch đầu dòng, viết lại từng ý riêng biệt, TUYỆT ĐỐI KHÔNG GOM thành một đầu dòng hay một đoạn văn nói liên tiếp nhau. Mỗi gạch đầu dòng phải xuống dòng riêng.
               - Mục nào có đoạn văn đơn (như Mục tiêu nghề nghiệp / Objective), hãy giữ nguyên dạng đoạn văn súc tích (1-2 câu), TUYỆT ĐỐI KHÔNG tự chèn thêm gạch đầu dòng '-'.
               - Nếu có mục 'TARGET_JOB' hoặc 'TITLE': Chỉ xuất đúng TÊN CHỨC DANH NGHỀ NGHIỆP chuẩn mực bám sát yêu cầu JD (1 dòng duy nhất). TUYỆT ĐỐI KHÔNG dùng dấu ngoặc đơn '()' hay ngoặc vuông '[]', TUYỆT ĐỐI KHÔNG dùng từ 'định hướng', 'mong muốn', 'hướng đến'.
            2. Tối ưu từng mục tương ứng theo cấu trúc Google XYZ: Action Verb + Chuyên môn cụ thể + Giá trị định tính/định lượng chân thực của ngành.
            3. Tuyệt đối không tự bịa đặt số liệu hoặc phần trăm nếu gốc không có. Đo lường bằng kết quả nghiệp vụ thực tế.
            4. TỐI ƯU TOÀN DIỆN BÁM SÁT YÊU CẦU JD: Nếu có 'Yêu cầu tuyển dụng', hãy chủ động nâng tầm các mục trên CV lên tương xứng với vị trí '{{targetTitle}}', khéo léo tích hợp các kỹ năng, công nghệ, công cụ và tiêu chuẩn chất lượng từ JD vào ngữ cảnh thực tế của ứng viên để tối đa hóa điểm số ATS.
            5. TUYỆT ĐỐI KHÔNG LẪN LỘN: Nội dung của mục nào chỉ viết lại cho mục đó, không được chép nội dung của mục khác (như Experience hay Projects) ghép vào mục Objective!
            6. {{langInstruction}}

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
        if (string.Equals(request.SectionType, "TARGET_JOB", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.SectionType, "TITLE", StringComparison.OrdinalIgnoreCase)) {
            var targetRole = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
            return $$"""
                Bạn là chuyên gia tư vấn tuyển dụng.
                Nhiệm vụ: Gợi ý chức danh nghề nghiệp mục tiêu (Target Job Title) chuẩn xác dựa vào vị trí tuyển dụng '{{targetRole}}'.
                QUY TẮC BẮT BUỘC:
                1. Trả về DUY NHẤT một dòng tên chức danh nghề nghiệp chuẩn xác (2 - 7 từ).
                2. TUYỆT ĐỐI KHÔNG dùng dấu ngoặc đơn '()', ngoặc vuông '[]'.
                3. TUYỆT ĐỐI KHÔNG dùng các từ 'định hướng', 'hướng đến', 'mong muốn'.
                4. {{ResolveLanguageInstruction(request.Language)}}
                5. CHỈ TRẢ VỀ DUY NHẤT TÊN CHỨC DANH (không lời chào, không giải thích):

                Vị trí hiện tại trên CV:
                "{{request.Content ?? request.CvContext}}"
                """;
        }

        if (string.Equals(request.SectionType, "SKILLS", StringComparison.OrdinalIgnoreCase)) {
            var targetRole = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
            return $$"""
                Bạn là chuyên gia tư vấn tối ưu CV chuyên nghiệp.
                Nhiệm vụ: Phân tích mục KỸ NĂNG CHUYÊN MÔN và đưa ra GỢI Ý BỔ SUNG KỸ NĂNG CÓ CHỌN LỌC hướng đến vị trí '{{targetRole}}'.

                NGUYÊN TẮC:
                1. KHÔNG viết thành câu văn Google XYZ. Bảo tồn 100% format cấu trúc hiện tại của ứng viên (nhóm in đậm **Tên nhóm:**, gạch đầu dòng • hoặc -, dấu phẩy...).
                2. Giữ nguyên toàn bộ kỹ năng gốc của ứng viên.
                3. Bổ sung các kỹ năng từ JD vào đúng nhóm chuyên môn, đánh dấu rõ kỹ năng gợi ý theo định dạng **[Gợi ý theo JD: TênKỹNăng]**.
                4. {{ResolveLanguageInstruction(request.Language)}}
                5. CHỈ TRẢ VỀ DUY NHẤT NỘI DUNG KỸ NĂNG ĐÃ GỢI Ý (Không lời chào, không giải thích):

                Kỹ năng hiện tại:
                "{{request.Content ?? request.CvContext}}"
                """;
        }

        var targetTitle = request.TargetJobTitle ?? "Vị trí chuyên môn mục tiêu";
        var langInstruction = ResolveLanguageInstruction(request.Language);

        return $$"""
            Bạn là chuyên gia tư vấn tuyển dụng cấp cao và tối ưu CV chuyên nghiệp đa ngành nghề.
            Nhiệm vụ: Viết lại nội dung CV của ứng viên theo chuẩn Google XYZ hướng đến vị trí '{{targetTitle}}'.

            {{GoldStandardFewShotExamples}}

            NGUYÊN TẮC CỐT LÕI (BẢO TOÀN CẤU TRÚC VÀ FORMAT 100%):
            1. BẢO TOÀN SỐ LƯỢNG VÀ ĐỊNH DẠNG GẠCH ĐẦU DÒNG (BẮT BUỘC):
               - Nếu nội dung gốc có bao nhiêu gạch đầu dòng (bullet point '•', '-', '*') hoặc bao nhiêu ý, BẮT BUỘC giữ nguyên bấy nhiêu gạch đầu dòng tương ứng.
               - TUYỆT ĐỐI KHÔNG GỘP, KHÔNG GOM CÁC GẠCH ĐẦU DÒNG THÀNH 1 ĐOẠN VĂN HAY CÂU NÓI LIÊN TIẾP NHAU.
               - Mỗi gạch đầu dòng là một ý độc lập, BẮT BUỘC phải xuống dòng riêng biệt ('\n').
               - Nếu nội dung gốc là một đoạn văn đơn (như Mục tiêu nghề nghiệp / Objective), hãy giữ nguyên là MỘT đoạn văn ngắn gọn, súc tích (1-2 câu), TUYỆT ĐỐI KHÔNG tự chèn thêm gạch đầu dòng '-'.
            2. Cấu trúc Google XYZ cho từng ý: Accomplished [X] (Nhiệm vụ/Thành tựu), measured by [Y] (Thước đo/Giá trị thực tế), by doing [Z] (Phương pháp/Công cụ/Kỹ năng chuyên môn).
            3. Bắt đầu mỗi gạch đầu dòng bằng Động từ hành động thực chiến phù hợp với ngành nghề (Phát triển, Thiết kế, Tối ưu hóa, Điều phối, Giảng dạy, Phân tích, Vận hành, Hoạch định / Delivered, Optimized, Directed...).
            4. Tuyệt đối không tự bịa đặt số liệu hoặc % nếu nội dung gốc không có. Đo lường bằng giá trị nghiệp vụ thực tế của ngành.
            5. Bám sát yêu cầu JD: Lồng ghép các kỹ năng, công nghệ và tiêu chuẩn từ JD vào câu văn một cách tự nhiên để tối ưu ATS.
            6. {{langInstruction}}
            7. BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT VĂN BẢN ĐÃ VIẾT LẠI (Không bọc mã markdown ```, không dấu ngoặc kép bên ngoài, không lời chào hay giải thích thừa):

            THÔNG TIN ĐẦU VÀO:
            - Vị trí mục tiêu: {{targetTitle}}
            {{(string.IsNullOrWhiteSpace(request.JobContext) ? "" : $"- Yêu cầu tuyển dụng (JD chắt lọc):\n{request.JobContext}\n")}}
            - Nội dung cần viết lại:
            "{{request.Content ?? request.CvContext}}"
            """;
    }

    public static CvEnhanceResult CreateFallbackEnhancement(CvEnhanceRequest request) {
        var isEn = string.Equals(request.Language, "en", StringComparison.OrdinalIgnoreCase);

        if (string.Equals(request.SectionType, "TARGET_JOB", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(request.SectionType, "TITLE", StringComparison.OrdinalIgnoreCase)) {
            var rawTitle = !string.IsNullOrWhiteSpace(request.TargetJobTitle)
                ? request.TargetJobTitle.Trim()
                : (request.Content ?? (isEn ? "Specialist" : "Chuyên viên chuyên môn"));
            var cleanTitle = System.Text.RegularExpressions.Regex.Replace(rawTitle, @"\s*\([^)]*\)", "").Trim();
            cleanTitle = System.Text.RegularExpressions.Regex.Replace(cleanTitle, @"\s*\[[^\]]*\]", "").Trim();
            return new CvEnhanceResult(
                OriginalContent: request.Content ?? cleanTitle,
                EnhancedContent: cleanTitle,
                SuggestedKeywords: new[] { cleanTitle },
                Improvements: new[] { "Chuẩn hóa chức danh bám sát vị trí tuyển dụng." },
                DetectedSection: "TARGET_JOB",
                ConversationTitle: isEn ? "Job Title Optimization" : "Tối ưu vị trí ứng tuyển"
            );
        }

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
        var results = request.Sections.Select(s => {
            var isTargetJob = string.Equals(s.SectionType, "TARGET_JOB", StringComparison.OrdinalIgnoreCase) ||
                              string.Equals(s.SectionType, "TITLE", StringComparison.OrdinalIgnoreCase);
            var content = isTargetJob && !string.IsNullOrWhiteSpace(request.TargetJobTitle)
                ? System.Text.RegularExpressions.Regex.Replace(request.TargetJobTitle, @"\s*\([^)]*\)", "").Trim()
                : s.Content;

            return new CvSectionEnhancedResult(
                SectionType: s.SectionType,
                OriginalContent: s.Content,
                EnhancedContent: content,
                SuggestedKeywords: new[] { s.SectionType },
                Improvements: new[] { isTargetJob ? "Chuẩn hóa chức danh bám sát vị trí tuyển dụng." : "Bảo toàn nội dung gốc do dịch vụ AI đang bận." }
            );
        }).ToList();

        return new CvBatchEnhanceResult(results);
    }

    public static string BuildMatchAnalysisPrompt(string cvText, string jobText, decimal score) {
        return $$"""
            Bạn là hệ thống AI phân tích tuyển dụng thông minh chuẩn quốc tế đa ngành nghề.
            Điểm tương đồng tính toán giữa CV và JD đã được xác định là: {{score:F2}}%.
            Nhiệm vụ: Phân tích chi tiết sự phù hợp giữa CV và JD dưới đây và trả về định dạng JSON nghiêm ngặt.
            Quy tắc ngôn ngữ: Nếu CV và JD chủ yếu bằng Tiếng Anh, xuất JSON bằng Tiếng Anh (English). Nếu bằng Tiếng Việt, xuất JSON bằng Tiếng Việt.
            
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
