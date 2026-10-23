import { useOutletContext } from "react-router-dom";
import {
  Users,
  Calendar,
  ShieldCheck,
  Briefcase,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import Button from "@/components/Button";
import { useCompanyMembers } from "@/hooks/queries/useCompany";
import type { CompanyOutletContext } from "./CompanyDetailLayout";

export function CompanyOverviewTab() {
  const { company } = useOutletContext<CompanyOutletContext>();
  const { data: membersData } = useCompanyMembers(company.id);
  const memberCount = membersData?.totalCount ?? 1;

  const isVerified = company.verificationStatus === "Verified";
  const isPending = company.verificationStatus === "Pending";
  const isRejected = company.verificationStatus === "Rejected";

  const handleCreateJob = () => {
    // Navigate to job posting or show notice
    alert(`Mở giao diện tạo tin tuyển dụng (JD) cho công ty: ${company.name}`);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Cảnh báo Trạng thái Duyệt */}
      {isPending && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
          <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              Hồ sơ doanh nghiệp đang chờ Admin phê duyệt
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
              Theo quy tắc hệ thống (BR-01), doanh nghiệp cần được Quản trị viên
              thẩm định và duyệt thông tin trước khi có thể đăng tin tuyển dụng
              công khai. Nút <strong>Tạo JD tuyển dụng</strong> sẽ được kích
              hoạt ngay sau khi công ty được duyệt.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-rose-900">
              Hồ sơ doanh nghiệp đã bị từ chối phê duyệt
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-rose-800">
              Vui lòng kiểm tra lại thông tin đăng ký, mã số thuế hoặc liên hệ
              ban quản trị để được hỗ trợ hướng dẫn bổ sung hồ sơ hợp lệ.
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Số lượng thành viên */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Thành viên HR
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Users className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-text-main">
            {memberCount}
          </p>
          <p className="mt-1 text-xs text-text-muted">Nhân sự trong công ty</p>
        </div>

        {/* Stat 2: Trạng thái pháp lý */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Xác thực pháp lý
            </span>
            <div
              className={`flex size-9 items-center justify-center rounded-xl ${
                isVerified
                  ? "bg-emerald-50 text-emerald-600"
                  : isPending
                    ? "bg-amber-50 text-amber-600"
                    : "bg-rose-50 text-rose-600"
              }`}
            >
              <ShieldCheck className="size-4.5" />
            </div>
          </div>
          <p
            className={`mt-3 text-lg font-bold ${
              isVerified
                ? "text-emerald-700"
                : isPending
                  ? "text-amber-700"
                  : "text-rose-700"
            }`}
          >
            {isVerified
              ? "Đã xác minh"
              : isPending
                ? "Chờ thẩm định"
                : "Từ chối duyệt"}
          </p>
          <p className="mt-1 text-xs text-text-muted">MST: {company.taxCode}</p>
        </div>

        {/* Stat 3: Ngày tạo hồ sơ */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Ngày khởi tạo
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="size-4.5" />
            </div>
          </div>
          <p className="mt-3 text-sm font-bold text-text-main">
            {formatDate(company.createdAt)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {company.verifiedAt
              ? `Duyệt: ${formatDate(company.verifiedAt)}`
              : "Đang xử lý"}
          </p>
        </div>

        {/* Stat 4: Tích hợp Đăng tin tuyển dụng (Tạo JD) */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">
              Chiến dịch tuyển dụng
            </span>
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="size-4.5" />
            </div>
          </div>

          <div className="mt-3">
            <Button
              variant="primary"
              icon={Plus}
              className="w-full! text-xs! font-semibold!"
              disabled={!isVerified}
              onClick={handleCreateJob}
            >
              Tạo JD tuyển dụng
            </Button>
            {!isVerified && (
              <p className="mt-1.5 text-center text-[10px] font-medium text-amber-700">
                Cần công ty được duyệt để đăng tin
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chi tiết thông tin công ty */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cột trái: Giới thiệu & Văn hóa */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="mb-3 text-sm font-bold tracking-wider text-text-muted uppercase">
              Giới thiệu doanh nghiệp
            </h2>
            <div className="text-sm leading-relaxed whitespace-pre-line text-text-main">
              {company.description ||
                "Doanh nghiệp chưa bổ sung mô tả chi tiết. Chủ sở hữu có thể cập nhật thông tin này trong tab Cài đặt."}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="mb-3 text-sm font-bold tracking-wider text-text-muted uppercase">
              Chính sách tuyển dụng tại {company.name}
            </h2>
            <div className="space-y-2 text-xs leading-relaxed text-text-muted">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>
                  Quy trình ứng tuyển minh bạch, phản hồi hồ sơ ứng viên nhanh
                  chóng.
                </span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>
                  Hỗ trợ sàng lọc hồ sơ ứng viên bằng công cụ Smart Matching AI.
                </span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>
                  Thành viên trong công ty cùng phối hợp quản lý các chiến dịch
                  tuyển dụng.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin liên hệ & Pháp lý */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase">
              Thông tin liên hệ
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl text-text-muted">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-muted">Email liên hệ</p>
                  <p className="mt-0.5 truncate font-semibold text-text-main">
                    {company.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl text-text-muted">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-muted">Số điện thoại</p>
                  <p className="mt-0.5 font-semibold text-text-main">
                    {company.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl text-text-muted">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-muted">Trụ sở công ty</p>
                  <p className="mt-0.5 leading-snug font-semibold text-text-main">
                    {company.address}
                  </p>
                </div>
              </div>

              {company.website && (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl text-text-muted">
                    <Globe className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-muted">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate font-semibold text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-sm font-bold tracking-wider text-text-muted uppercase">
              Hồ sơ pháp lý
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-text-muted">Mã số thuế:</span>
                <span className="font-mono font-semibold text-text-main">
                  {company.taxCode}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-text-muted">Trạng thái:</span>
                <span className="font-semibold text-text-main">
                  {company.verificationStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Cập nhật lần cuối:</span>
                <span className="font-semibold text-text-main">
                  {formatDate(company.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
