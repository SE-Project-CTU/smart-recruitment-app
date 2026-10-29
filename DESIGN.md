---
name: SmartHire
description: Nền tảng tuyển dụng thông minh và xây dựng CV tích hợp AI
colors:
  primary: "#1b3b6f"
  primary-dark: "#122a52"
  primary-light: "#3e5e8f"
  secondary: "#a6e1fa"
  secondary-light: "#d6f1fc"
  secondary-dark: "#6fc3e8"
  neutral-bg: "#f7fafc"
  neutral-surface: "#ffffff"
  neutral-border: "#e2e8f0"
  text-main: "#1a202c"
  text-muted: "#64748b"
  status-success: "#22c55e"
  status-warning: "#f59e0b"
  status-error: "#ef4444"
  status-info: "#3b82f6"
typography:
  display:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  "2xl": "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  input-search:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.full}"
    padding: "12px 24px 12px 48px"
  card-base:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.2xl}"
    padding: "24px"
---

# Design System: SmartHire

## Overview

**Creative North Star: "The Trust Navigator"**

SmartHire được thiết kế với tinh thần định vị sự nghiệp đáng tin cậy, vững chãi và hiện đại. Lấy cảm hứng từ sắc xanh thẳm của đại dương sâu thẳm kết hợp cùng những làn gió xanh băng trong trẻo, giao diện phản ánh cam kết dẫn lối ứng viên và nhà tuyển dụng tìm đến nhau một cách minh bạch, an tâm và chuẩn xác.

Triết lý thị giác của hệ thống đề cao sự tinh tế, cân bằng và thanh lịch. Thay vì lạm dụng các hiệu ứng thị giác rườm rà hay bóng đổ phức tạp gây quá tải nhận thức, SmartHire chọn cách làm chủ không gian bằng phân tầng màu nền (tonal layering), đường viền mảnh dẻ tinh tế (#e2e8f0), khoảng cách thở mạch lạc và phông chữ Montserrat đầy bản lĩnh.

**Key Characteristics:**
- **Thân thiện & Mềm mại:** Nút bấm hành động và thanh tìm kiếm chủ đạo dùng dáng bo viên thuốc (pill shape/`rounded-full`), mang đến cảm giác dễ tiếp cận và kích thích tương tác.
- **Phẳng có trật tự (Flat by Default):** Tuyệt đối không spam bóng đổ; độ sâu được kiến tạo thông qua sự tương phản giữa nền ứng dụng (#f7fafc), bề mặt thẻ (#ffffff) và đường phân cách thanh mảnh (#e2e8f0).
- **Trọng lượng kiểu chữ kỷ luật:** Tối đa mức đậm `font-semibold` cho nội dung thông thường, chỉ dành `font-bold` cho các tiêu đề lớn.

## Colors

Bảng màu mang phong cách hải quân công nghệ: uy nghiêm, tin cậy ở gam màu chính và tươi mới, giàu năng lượng ở các gam màu bổ trợ.

### Primary
- **Deep Oceanic Navy** (#1b3b6f): Màu nhận diện thương hiệu chủ đạo, xuất hiện ở nút bấm chính (CTA), tiêu đề nổi bật, trạng thái chọn và các điểm nhấn điều hướng quan trọng nhất. Thể hiện sự vững chắc và bảo chứng chất lượng.
- **Primary Dark** (#122a52): Dành cho trạng thái tương tác hover của nút bấm chính, viền nhấn khi active.
- **Primary Light** (#3e5e8f): Dành cho các phân đoạn bổ trợ trong biểu đồ hoặc điểm nhấn thứ cấp.

### Secondary
- **Glacier Sky** (#a6e1fa): Gam xanh băng tươi mát, dùng cho badge trạng thái kích hoạt, viền hover thẻ card và nền nhấn nhẹ khi phối hợp cùng màu chính.
- **Secondary Light** (#d6f1fc): Dùng làm nền highlight mềm (tint background) cho các khối ghi chú, thông báo nhẹ hoặc mục đang được chọn.
- **Secondary Dark** (#6fc3e8): Dành cho các chi tiết đồ họa, icon phụ và hiệu ứng chuyển động tương tác.

### Neutral
- **Mist White** (#f7fafc): Màu nền chuẩn của ứng dụng (`--color-bg`), giữ cho mắt người dùng luôn thoải mái khi đọc lượng lớn thông tin tuyển dụng.
- **Pure Surface** (#ffffff): Màu nền của thẻ (`--color-surface`), bảng biểu và hộp thoại, tạo bề mặt nổi bật trên nền Mist White.
- **Crisp Border** (#e2e8f0): Màu viền chuẩn (`--color-border`) cho thẻ card, vách ngăn và khung nhập liệu.
- **Charcoal Ink** (#1a202c): Màu chữ chính (`--color-text-main`), đậm đà và có độ tương phản tối ưu trên nền sáng.
- **Slate Muted** (#64748b): Màu chữ phụ (`--color-text-muted`), dùng cho nhãn mô tả, ngày tháng, thông tin định danh thứ cấp.

### Named Rules
**The Rarity of Navy Rule.** Màu Deep Oceanic Navy (#1b3b6f) chỉ được xuất hiện ở tối đa 15% diện tích màn hình để giữ nguyên vẹn giá trị dẫn hướng và sức nặng thị giác của các hành động chính.
**The No-Color-Inflation Rule.** Không tự ý thêm các mã màu nằm ngoài bảng màu đã định nghĩa trong `index.css`; mọi trạng thái phản hồi phải tái sử dụng màu hệ thống hoặc các biến đã chuẩn hóa.

## Typography

**Display Font:** Montserrat, sans-serif  
**Body Font:** Montserrat, sans-serif  
**Label/Mono Font:** Montserrat, sans-serif  

**Character:** Montserrat mang kết cấu hình học hiện đại (geometric), đường nét dứt khoát và khoảng cách ký tự thoáng đạt, tạo nên nét đẹp hiện đại, chuyên nghiệp và giàu nội lực cho một nền tảng công nghệ số.

### Hierarchy
- **Display** (Bold 700, 3rem / 48px, line-height 1.15): Dành cho Hero Title ở trang chủ, tiêu đề các banner lớn (CandidateDashboardBanner).
- **Headline** (Bold 700, 1.875rem / 30px, line-height 1.25): Dành cho tiêu đề từng phân mục lớn (Section Titles).
- **Title** (Semibold 600, 1.125rem / 18px, line-height 1.4): Dành cho tên vị trí tuyển dụng, tiêu đề card, tên công ty.
- **Body** (Regular 400 / Medium 500, 0.875rem / 14px, line-height 1.5): Dành cho nội dung mô tả công việc (JD), CV và các đoạn văn bản giải thích.
- **Label** (Semibold 600, 0.75rem / 12px, line-height 1.3): Dành cho badge kỹ năng, tag trạng thái, mức lương và thông tin phụ trợ.

### Named Rules
**The Semibold Ceiling Rule.** Ngoại trừ các thẻ tiêu đề lớn (`<h1>`, `<h2>`, `.section-title`), độ đậm tối đa của mọi văn bản trong hệ thống chỉ được đạt mức `font-semibold` (600). Tuyệt đối không dùng `font-bold` cho văn bản body, button hay label.

## Layout

Hệ thống layout sử dụng lưới 12 cột linh hoạt với giới hạn chiều rộng nội dung tối đa chuẩn hóa (`max-w-7xl` hoặc `max-w-6xl` căn giữa màn hình).

- **Khoảng cách nhịp điệu (Spacing Rhythm):** Dựa trên hệ số 4px/8px chuẩn mực: 4px (`xs`), 8px (`sm`), 16px (`md`), 24px (`lg`), 32px (`xl`), 48px (`2xl`).
- **Khoảng cách giữa các section:** Tối thiểu 48px đến 64px trên máy tính để tạo không gian thoáng đãng cho mắt nghỉ ngơi.
- **Container & Padding:** Các thẻ nội dung sử dụng padding tiêu chuẩn 20px - 24px (`p-5` hoặc `p-6`) để đảm bảo lề trong luôn cân xứng với bo góc thẻ.

## Elevation & Depth

SmartHire áp dụng triết lý **Flat-by-Default kết hợp Tonal Layering**. Hệ thống từ chối các khối bóng đổ nặng nề hay đổ bóng chồng chéo làm rối mắt người dùng.

Chiều sâu giao diện được thiết lập tự nhiên thông qua:
1. **Tương phản nền (Ground Plane):** Nền ứng dụng màu xám phấn nhẹ Mist White (#f7fafc), bề mặt tương tác màu trắng tinh khiết Pure Surface (#ffffff).
2. **Đường viền mảnh định hình (Crisp Border):** Tất cả thẻ và ô nhập liệu đều có viền 1px mỏng nhẹ (#e2e8f0).
3. **Hover phản hồi bằng viền & màu nền:** Khi di chuột qua thẻ, thẻ phản hồi bằng cách đổi màu viền sang tông xanh (`hover:border-sky-400`) hoặc chuyển màu nền nhẹ (`hover:bg-linear-to-b hover:from-sky-50/50 hover:to-sky-200`) thay vì dùng bóng đổ lớn.

### Named Rules
**The Zero-Shadow Doctrine.** Tuyệt đối không spam shadow lên các bề mặt tĩnh. Ở trạng thái nghỉ, toàn bộ thẻ và khối nội dung đều phẳng hoàn toàn (`shadow: none` hoặc tối đa `shadow-xs`). Bóng mờ chỉ xuất hiện rất nhẹ (`shadow-sm`) khi nhấc bề mặt tương tác (modal nổi, dropdown menu mở).

## Shapes

Ngôn ngữ hình khối của SmartHire là sự kết hợp hài hòa giữa **bo góc tròn mềm mại thân thiện (Pill-shaped)** ở các điểm chạm tương tác và **bo góc thẻ vừa vặn có kiểm soát (Max-2xl)** ở các khối nội dung.

- **Nút bấm & Ô tìm kiếm:** Bo tròn hoàn toàn dạng viên thuốc (`rounded-full` / 9999px), tạo điểm nhấn xúc giác lôi cuốn, mềm mại và hiện đại.
- **Thẻ Card & Bảng biểu:** Bo góc tối đa mức `rounded-2xl` (16px) hoặc `rounded-xl` (14px). Tuyệt đối không kéo bo góc thẻ vượt quá giới hạn 2xl (16px) để tránh làm méo mó bố cục văn bản bên trong.
- **Linh kiện nhỏ (Badge, Checkbox, Menu item):** Bo góc `rounded-md` (6px) hoặc `rounded-lg` (8px).

### Named Rules
**The Card Radius Ceiling Rule.** Mọi thành phần chứa nội dung (Card, Container, Dialog, Box) có bán kính bo góc tối đa là `rounded-2xl` (16px). Dáng `rounded-full` chỉ dành riêng cho Button, Search Input, Chip/Badge và Avatar.

## Components

### Buttons
- **Shape:** Bo tròn viên thuốc (`rounded-full`, 9999px).
- **Primary (`.btn-primary`):** Nền Deep Oceanic Navy (`#1b3b6f`), chữ trắng, padding `8px 16px` (`px-4 py-2`), font-medium text-sm. Khi hover: nền chuyển Primary Dark (`#122a52`), chuyển động nhẹ với `active:scale-[0.98]`.
- **Secondary (`.btn-secondary`):** Nền trong suốt, viền 1px ring-inset Deep Oceanic Navy (`#1b3b6f`), chữ xanh navy. Khi hover: nền xanh nhẹ `bg-secondary-light/40`, viền và chữ chuyển Primary Dark.
- **Outline (`.btn-outline`):** Nền trong suốt, viền ring trắng, dùng trên các nền tối hoặc banner xanh.

### Inputs & Fields
- **Search Bar (`.input-primary`):** Bo tròn viên thuốc (`rounded-full`), viền 2px trong suốt trên nền trắng tinh, padding `py-3 pr-6 pl-14`, bóng phẳng. Khi focus: viền chuyển sáng Deep Oceanic Navy (`focus:border-primary`).
- **Base Input (`Input`):** Dành cho form nhập liệu chi tiết trong modal/bảng. Bo góc vừa phải (`rounded-md` / 6px), viền mảnh 1px (#e2e8f0), chiều cao chuẩn 36px (`h-9`), padding `px-2.5 py-1`.

### Cards
- **Job Card & Container Cards:** Bo góc `rounded-2xl` (16px), nền trắng Pure Surface (#ffffff), viền 1px Crisp Border (#e2e8f0), padding `p-6`. Không sử dụng bóng đổ tĩnh.
- **Trạng thái Active/Selected:** Viền Deep Oceanic Navy (`border-primary`), nền tinted `bg-secondary-light/20`.
- **Trạng thái Hover:** Viền chuyển xanh `border-sky-400`, nền chuyển sắc nhẹ từ sky-50 sang sky-200.

### Badges & Tags
- **Style:** Bo tròn nhẹ (`rounded-md` hoặc `rounded-full`), padding `px-2.5 py-0.5`, chữ cỡ nhỏ `text-xs font-semibold`.
- **Color Roles:** Xanh biển dịu cho trạng thái xem xét, xanh lá cho đã duyệt/thành công, cam hổ phách cho chờ xử lý, đỏ cho từ chối/hủy.

## Do's and Don'ts

### Do:
- **Do** sử dụng dáng bo viên thuốc (`rounded-full`) cho các nút bấm chính và thanh tìm kiếm để giữ nét thân thiện, hiện đại.
- **Do** giới hạn bo góc cho các thẻ card ở mức tối đa `rounded-2xl` (16px).
- **Do** tạo chiều sâu bằng phân tầng màu nền (Mist White #f7fafc dưới đáy, Pure Surface #ffffff phía trên) và đường viền mảnh 1px (#e2e8f0).
- **Do** giữ độ đậm nhất của văn bản ở mức `font-semibold` (600), ngoại trừ các tiêu đề lớn của trang.
- **Do** sử dụng các biến CSS và token đã chuẩn hóa trong `Frontend/src/index.css`.

### Don't:
- **Don't** spam shadow hay sử dụng các hiệu ứng đổ bóng đen đậm, bóng mờ lan rộng trên bề mặt phẳng tĩnh.
- **Don't** bo góc thẻ card vượt quá `rounded-2xl` (như `rounded-3xl` hay `rounded-[32px]`).
- **Don't** sử dụng font-bold (700) tràn lan trong các khối văn bản thông thường, button hay nhãn form.
- **Don't** sử dụng inline styles hoặc tùy tiện pha trộn màu sắc nằm ngoài bảng màu chuẩn của hệ thống.
- **Don't** thêm viền kép hoặc kết hợp cả viền đậm lẫn bóng nổi trên cùng một component gây nặng nề thị giác.
