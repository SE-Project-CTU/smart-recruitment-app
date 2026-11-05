using System.Text.RegularExpressions;
using FuzzySharp;

namespace SmartHire.Application.Features.Ai.Matching;

public static class SkillNormalizationMap {
    private static readonly Dictionary<string, string> CanonicalMap = new(StringComparer.OrdinalIgnoreCase) {
        // ==========================================
        // 1. CÔNG NGHỆ THÔNG TIN & PHẦN MỀM (IT & SOFTWARE)
        // ==========================================
        ["c#"] = "csharp",
        ["c sharp"] = "csharp",
        [".net"] = "dotnet",
        [".net 10"] = "dotnet",
        [".net 8"] = "dotnet",
        [".net core"] = "dotnet",
        ["asp.net"] = "dotnet",
        ["asp.net core"] = "dotnet",
        ["dotnet core"] = "dotnet",
        ["react"] = "react",
        ["reactjs"] = "react",
        ["react.js"] = "react",
        ["react 18"] = "react",
        ["react 19"] = "react",
        ["react native"] = "react-native",
        ["vue"] = "vue",
        ["vuejs"] = "vue",
        ["vue.js"] = "vue",
        ["vue 3"] = "vue",
        ["angular"] = "angular",
        ["angularjs"] = "angular",
        ["node"] = "nodejs",
        ["nodejs"] = "nodejs",
        ["node.js"] = "nodejs",
        ["typescript"] = "typescript",
        ["ts"] = "typescript",
        ["javascript"] = "javascript",
        ["js"] = "javascript",
        ["python"] = "python",
        ["python 3"] = "python",
        ["java"] = "java",
        ["golang"] = "golang",
        ["go"] = "golang",
        ["php"] = "php",
        ["laravel"] = "laravel",
        ["docker"] = "docker",
        ["containerization"] = "docker",
        ["kubernetes"] = "k8s",
        ["k8s"] = "k8s",
        ["k8"] = "k8s",
        ["kube"] = "k8s",
        ["postgres"] = "postgresql",
        ["postgresql"] = "postgresql",
        ["postgre sql"] = "postgresql",
        ["postgre-sql"] = "postgresql",
        ["postgre"] = "postgresql",
        ["pgsql"] = "postgresql",
        ["postgressql"] = "postgresql",
        ["postgress"] = "postgresql",
        ["mysql"] = "mysql",
        ["sql server"] = "mssql",
        ["mssql"] = "mssql",
        ["mongodb"] = "mongodb",
        ["redis"] = "redis",
        ["redis cache"] = "redis",
        ["aws"] = "aws",
        ["amazon web services"] = "aws",
        ["azure"] = "azure",
        ["gcp"] = "gcp",
        ["google cloud"] = "gcp",
        ["clean architecture"] = "clean-architecture",
        ["microservices"] = "microservices",
        ["microservice"] = "microservices",
        ["rest api"] = "restful-api",
        ["restful api"] = "restful-api",
        ["restful"] = "restful-api",
        ["graphql"] = "graphql",
        ["git"] = "git",
        ["github"] = "git",
        ["gitlab"] = "git",
        ["ci/cd"] = "cicd",
        ["cicd"] = "cicd",
        ["devops"] = "devops",
        ["machine learning"] = "machine-learning",
        ["deep learning"] = "deep-learning",
        ["ai"] = "artificial-intelligence",
        ["trí tuệ nhân tạo"] = "artificial-intelligence",
        ["automation test"] = "automation-testing",
        ["selenium"] = "automation-testing",
        ["manual test"] = "manual-testing",

        // ==========================================
        // 2. KINH DOANH, BÁN HÀNG & TIẾP THỊ (SALES & MARKETING)
        // ==========================================
        ["google ads"] = "google-ads",
        ["adwords"] = "google-ads",
        ["google adwords"] = "google-ads",
        ["facebook ads"] = "facebook-ads",
        ["fb ads"] = "facebook-ads",
        ["meta ads"] = "facebook-ads",
        ["tiktok ads"] = "tiktok-ads",
        ["seo"] = "seo",
        ["tối ưu hóa công cụ tìm kiếm"] = "seo",
        ["search engine optimization"] = "seo",
        ["sem"] = "sem",
        ["content marketing"] = "content-marketing",
        ["viết bài chuẩn seo"] = "content-marketing",
        ["sáng tạo nội dung"] = "content-marketing",
        ["copywriting"] = "copywriting",
        ["email marketing"] = "email-marketing",
        ["google analytics"] = "ga4",
        ["ga4"] = "ga4",
        ["cac"] = "cac-ltv",
        ["ltv"] = "cac-ltv",
        ["tableau"] = "data-visualization",
        ["power bi"] = "data-visualization",
        ["powerbi"] = "data-visualization",
        ["b2b"] = "b2b-sales",
        ["b2b sales"] = "b2b-sales",
        ["bán hàng doanh nghiệp"] = "b2b-sales",
        ["b2c"] = "b2c-sales",
        ["bán lẻ"] = "b2c-sales",
        ["telesales"] = "telesales",
        ["bán hàng qua điện thoại"] = "telesales",
        ["crm"] = "crm-system",
        ["hubspot"] = "crm-system",
        ["salesforce"] = "crm-system",
        ["lead generation"] = "lead-generation",
        ["tìm kiếm khách hàng tiềm năng"] = "lead-generation",
        ["đàm phán"] = "negotiation",
        ["negotiation"] = "negotiation",
        ["thương lượng"] = "negotiation",
        ["chăm sóc khách hàng"] = "customer-service",
        ["customer service"] = "customer-service",
        ["hỗ trợ khách hàng"] = "customer-service",
        ["customer support"] = "customer-service",
        ["quản lý khách hàng"] = "account-management",
        ["account management"] = "account-management",

        // ==========================================
        // 3. TÀI CHÍNH, KẾ TOÁN & NGÂN HÀNG (FINANCE & ACCOUNTING)
        // ==========================================
        ["báo cáo tài chính"] = "financial-reporting",
        ["financial reporting"] = "financial-reporting",
        ["lập báo cáo tài chính"] = "financial-reporting",
        ["kế toán tổng hợp"] = "general-accounting",
        ["general accounting"] = "general-accounting",
        ["kế toán thuế"] = "tax-accounting",
        ["tax accounting"] = "tax-accounting",
        ["quyết toán thuế"] = "tax-accounting",
        ["kê khai thuế"] = "tax-accounting",
        ["kiểm toán"] = "auditing",
        ["auditing"] = "auditing",
        ["kiểm toán nội bộ"] = "internal-audit",
        ["internal audit"] = "internal-audit",
        ["misa"] = "misa-software",
        ["phần mềm misa"] = "misa-software",
        ["fast"] = "fast-accounting",
        ["bravo"] = "bravo-erp",
        ["sap"] = "sap-erp",
        ["sap erp"] = "sap-erp",
        ["excel nâng cao"] = "advanced-excel",
        ["advanced excel"] = "advanced-excel",
        ["vlookup"] = "advanced-excel",
        ["pivot table"] = "advanced-excel",
        ["vas"] = "accounting-standards",
        ["chuẩn mực kế toán việt nam"] = "accounting-standards",
        ["ifrs"] = "ifrs-standards",
        ["chuẩn mực kế toán quốc tế"] = "ifrs-standards",
        ["phân tích tài chính"] = "financial-analysis",
        ["financial analysis"] = "financial-analysis",
        ["thẩm định tín dụng"] = "credit-risk-assessment",
        ["credit appraisal"] = "credit-risk-assessment",

        // ==========================================
        // 4. QUẢN TRỊ NHÂN SỰ & HÀNH CHÍNH (HR & ADMIN)
        // ==========================================
        ["tuyển dụng"] = "talent-acquisition",
        ["talent acquisition"] = "talent-acquisition",
        ["recruitment"] = "talent-acquisition",
        ["headhunter"] = "talent-acquisition",
        ["c&b"] = "compensation-benefits",
        ["compensation and benefits"] = "compensation-benefits",
        ["tiền lương và phúc lợi"] = "compensation-benefits",
        ["bảo hiểm xã hội"] = "social-insurance",
        ["bhxh"] = "social-insurance",
        ["luật lao động"] = "labor-law",
        ["labor law"] = "labor-law",
        ["đào tạo nội bộ"] = "learning-development",
        ["l&d"] = "learning-development",
        ["learning and development"] = "learning-development",
        ["kpi"] = "performance-management",
        ["okr"] = "performance-management",
        ["đánh giá hiệu quả công việc"] = "performance-management",
        ["hành chính văn phòng"] = "office-administration",
        ["office administration"] = "office-administration",
        ["văn thư lưu trữ"] = "document-management",

        // ==========================================
        // 5. LOGISTICS, XUẤT NHẬP KHẨU & SẢN XUẤT (SUPPLY CHAIN & LOGISTICS)
        // ==========================================
        ["xuất nhập khẩu"] = "import-export",
        ["xnk"] = "import-export",
        ["import export"] = "import-export",
        ["thủ tục hải quan"] = "customs-clearance",
        ["customs clearance"] = "customs-clearance",
        ["khai báo hải quan"] = "customs-clearance",
        ["incoterm"] = "incoterms",
        ["incoterms"] = "incoterms",
        ["incoterm 2020"] = "incoterms",
        ["incoterms 2020"] = "incoterms",
        ["incoterm2020"] = "incoterms",
        ["incoterms2020"] = "incoterms",
        ["điều kiện incoterms"] = "incoterms",
        ["vận tải quốc tế"] = "freight-forwarding",
        ["freight forwarding"] = "freight-forwarding",
        ["quản lý kho"] = "warehouse-management",
        ["warehouse management"] = "warehouse-management",
        ["wms"] = "warehouse-management",
        ["chuỗi cung ứng"] = "supply-chain",
        ["supply chain"] = "supply-chain",
        ["mua hàng"] = "procurement-purchasing",
        ["purchasing"] = "procurement-purchasing",
        ["procurement"] = "procurement-purchasing",
        ["qa/qc"] = "quality-assurance-control",
        ["qa qc"] = "quality-assurance-control",
        ["quản lý chất lượng"] = "quality-assurance-control",
        ["iso 9001"] = "iso-standards",
        ["iso 14001"] = "iso-standards",
        ["5s"] = "5s-kaizen",
        ["kaizen"] = "5s-kaizen",
        ["lean"] = "lean-six-sigma",
        ["six sigma"] = "lean-six-sigma",

        // ==========================================
        // 6. GIÁO DỤC, SƯ PHẠM & ĐÀO TẠO (EDUCATION & PEDAGOGY)
        // ==========================================
        ["sư phạm"] = "pedagogy",
        ["pedagogy"] = "pedagogy",
        ["thiết kế bài giảng"] = "lesson-planning",
        ["soạn giáo án"] = "lesson-planning",
        ["lesson planning"] = "lesson-planning",
        ["quản lý lớp học"] = "classroom-management",
        ["classroom management"] = "classroom-management",
        ["blended learning"] = "blended-learning",
        ["học kết hợp"] = "blended-learning",
        ["canvas lms"] = "lms-platforms",
        ["moodle"] = "lms-platforms",
        ["google classroom"] = "lms-platforms",
        ["khảo thí"] = "educational-assessment",
        ["đánh giá chuẩn đầu ra"] = "educational-assessment",

        // ==========================================
        // 7. Y TẾ & DƯỢC PHẨM (HEALTHCARE & PHARMACY)
        // ==========================================
        ["dược sĩ"] = "pharmacist",
        ["pharmacist"] = "pharmacist",
        ["dược lâm sàng"] = "clinical-pharmacy",
        ["clinical pharmacy"] = "clinical-pharmacy",
        ["tư vấn dùng thuốc"] = "medication-counseling",
        ["điều dưỡng"] = "nursing-care",
        ["nursing"] = "nursing-care",
        ["chăm sóc bệnh nhân"] = "patient-care",
        ["quản lý thiết bị y tế"] = "medical-devices",

        // ==========================================
        // 8. THIẾT KẾ, MỸ THUẬT & KIẾN TRÚC (DESIGN & MULTIMEDIA)
        // ==========================================
        ["graphic design"] = "graphic-design",
        ["thiết kế đồ họa"] = "graphic-design",
        ["ui/ux"] = "ui-ux-design",
        ["ui/ux design"] = "ui-ux-design",
        ["thiết kế giao diện"] = "ui-ux-design",
        ["photoshop"] = "adobe-photoshop",
        ["pts"] = "adobe-photoshop",
        ["illustrator"] = "adobe-illustrator",
        ["ai illustrator"] = "adobe-illustrator",
        ["figma"] = "figma",
        ["premiere"] = "video-editing",
        ["premiere pro"] = "video-editing",
        ["chỉnh sửa video"] = "video-editing",
        ["after effects"] = "motion-graphics",
        ["autocad"] = "cad-drafting",
        ["cad"] = "cad-drafting",
        ["revit"] = "revit-bim",
        ["bim"] = "revit-bim",
        ["sketchup"] = "3d-sketchup",
        ["3ds max"] = "3d-max",

        // ==========================================
        // 9. DU LỊCH, KHÁCH SẠN & ẨM THỰC (HOSPITALITY & F&B)
        // ==========================================
        ["quản trị khách sạn"] = "hotel-management",
        ["hospitality"] = "hotel-management",
        ["lễ tân"] = "front-desk-reception",
        ["receptionist"] = "front-desk-reception",
        ["pha chế"] = "barista-bartender",
        ["barista"] = "barista-bartender",
        ["bartender"] = "barista-bartender",
        ["bếp"] = "culinary-arts",
        ["đầu bếp"] = "culinary-arts",
        ["chef"] = "culinary-arts",
        ["hướng dẫn viên du lịch"] = "tour-guide",
        ["tour guide"] = "tour-guide",

        // ==========================================
        // 10. NGOẠI NGỮ (LANGUAGES & CERTIFICATIONS)
        // ==========================================
        ["tiếng anh"] = "english",
        ["english"] = "english",
        ["ielts"] = "english",
        ["toeic"] = "english",
        ["toefl"] = "english",
        ["tiếng nhật"] = "japanese",
        ["japanese"] = "japanese",
        ["n1"] = "japanese",
        ["n2"] = "japanese",
        ["n3"] = "japanese",
        ["n4"] = "japanese",
        ["tiếng trung"] = "chinese",
        ["chinese"] = "chinese",
        ["tiếng hoa"] = "chinese",
        ["hsk"] = "chinese",
        ["tiếng hàn"] = "korean",
        ["korean"] = "korean",
        ["topik"] = "korean"
    };

    public static string Normalize(string skill) {
        if (string.IsNullOrWhiteSpace(skill)) return string.Empty;

        var cleaned = skill.Trim().ToLowerInvariant();
        cleaned = Regex.Replace(cleaned, @"\s+", " ");

        if (CanonicalMap.TryGetValue(cleaned, out var canonical)) {
            return canonical;
        }

        // Loại bỏ ký tự phân cách, dấu chấm, gạch nối, khoảng trắng để bắt các biến thể gõ
        var noPunct = Regex.Replace(cleaned, @"[.\-_/\s]", "");
        if (noPunct == "postgresql" || noPunct == "postgres" || noPunct == "pgsql" || noPunct == "postgressql" || noPunct == "postgress") {
            return "postgresql";
        }
        if (noPunct.StartsWith("incoterm")) {
            return "incoterms";
        }
        if (noPunct.StartsWith("react") && !noPunct.Contains("native")) {
            return "react";
        }
        if (noPunct == "kubernetes" || noPunct == "k8s" || noPunct == "k8" || noPunct == "kube") {
            return "k8s";
        }
        if (noPunct == "photoshop" || noPunct == "photoshp" || noPunct == "pts") {
            return "adobe-photoshop";
        }

        // Loại bỏ tiền tố/hậu tố thông dụng
        var stripped = cleaned
            .Replace("framework", "")
            .Replace("library", "")
            .Replace("platform", "")
            .Replace("phần mềm", "")
            .Replace("kỹ năng", "")
            .Trim();

        if (CanonicalMap.TryGetValue(stripped, out canonical)) {
            return canonical;
        }

        return cleaned;
    }

    public static bool IsMatch(string candidateSkill, string targetSkill, int fuzzyThreshold = 80) {
        if (string.IsNullOrWhiteSpace(candidateSkill) || string.IsNullOrWhiteSpace(targetSkill)) {
            return false;
        }

        var normCandidate = Normalize(candidateSkill);
        var normTarget = Normalize(targetSkill);

        // Khớp chính xác Canonical/Normalized (Fast-Path O(1))
        if (string.Equals(normCandidate, normTarget, StringComparison.OrdinalIgnoreCase)) {
            return true;
        }

        // Kiểm tra sau khi loại bỏ dấu phân cách (bắt lệch ký tự vd "postgre sql" vs "postgresql")
        var noPunctCand = Regex.Replace(candidateSkill.ToLowerInvariant(), @"[.\-_/\s]", "");
        var noPunctTgt = Regex.Replace(targetSkill.ToLowerInvariant(), @"[.\-_/\s]", "");
        if (noPunctCand == noPunctTgt) {
            return true;
        }
        if (noPunctCand.Length >= 4 && noPunctTgt.Length >= 4) {
            if (noPunctCand.Contains(noPunctTgt) || noPunctTgt.Contains(noPunctCand)) {
                return true;
            }
        }

        // Kiểm tra chuỗi chứa nhau với độ dài an toàn >= 4 ký tự
        if (normCandidate.Length >= 4 && normTarget.Length >= 4) {
            if (normCandidate.Contains(normTarget, StringComparison.OrdinalIgnoreCase) ||
                normTarget.Contains(normCandidate, StringComparison.OrdinalIgnoreCase)) {
                return true;
            }
        }

        // Blacklist Guard: Chặn các cặp từ khác hẳn nhau nhưng tên na ná
        if (IsBlacklistedPair(normCandidate, normTarget)) {
            return false;
        }

        // Fuzzy Matching qua FuzzySharp (Levenshtein Ratio & Token Sort Ratio)
        int ratio = Fuzz.Ratio(normCandidate, normTarget);
        if (ratio >= fuzzyThreshold) {
            return true;
        }

        int tokenSortRatio = Fuzz.TokenSortRatio(candidateSkill.ToLowerInvariant(), targetSkill.ToLowerInvariant());
        if (tokenSortRatio >= fuzzyThreshold) {
            return true;
        }

        return false;
    }

    private static bool IsBlacklistedPair(string a, string b) {
        if ((a == "java" && b.StartsWith("javascript")) || (b == "java" && a.StartsWith("javascript"))) return true;
        if ((a == "c" && (b == "csharp" || b == "c++")) || (b == "c" && (a == "csharp" || a == "c++"))) return true;
        if ((a == "c++" && b == "csharp") || (b == "c++" && a == "csharp")) return true;
        if ((a == "sales" && b == "scale") || (b == "sales" && a == "scale")) return true;
        if ((a == "audit" && b == "adult") || (b == "audit" && a == "adult")) return true;
        if ((a == "lead" && b == "lean") || (b == "lead" && a == "lean")) return true;
        return false;
    }
}
