import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Check,
  X,
  ShieldCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCompanyStore } from "@/stores/companyStore";
import {
  useCompanyDetail,
  useAcceptInvitation,
  useRejectInvitation,
} from "@/hooks/queries/useCompany";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/api/errorHandler";

export function CompanyDetailDrawer() {
  const {
    isDrawerOpen,
    selectedCompanyId,
    invitationContext,
    closeCompanyDrawer,
    setActiveCompany,
  } = useCompanyStore();

  // Gọi API 2: GET /api/v1/companies/{id} để lấy đầy đủ chi tiết công ty, logo, mô tả, website, mã số thuế
  const {
    data: company,
    isLoading,
    isError,
    refetch,
  } = useCompanyDetail(selectedCompanyId || undefined);

  const { mutateAsync: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutateAsync: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation();

  // Đồng bộ thông tin công ty nhận được vào store
  useEffect(() => {
    if (company) {
      setActiveCompany(company);
    }
  }, [company, setActiveCompany]);

  const isPendingInvitation = invitationContext?.status === "Pending";
  const isExpired =
    invitationContext &&
    (invitationContext.status === "Expired" ||
      dayjs().isAfter(dayjs(invitationContext.expiresAt)));

  const handleAccept = async () => {
    if (!invitationContext) return;
    try {
      await acceptInvitation(invitationContext.id);
      toast.add({
        type: "success",
        description: `Bạn đã tham gia công ty ${company?.name || "doanh nghiệp"} thành công!`,
      });
      closeCompanyDrawer();
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể chấp nhận lời mời. Vui lòng thử lại sau.",
      );
      toast.add({ type: "error", description: msg });
    }
  };

  const handleReject = async () => {
    if (!invitationContext) return;
    try {
      await rejectInvitation(invitationContext.id);
      toast.add({
        type: "info",
        description: `Đã từ chối lời mời gia nhập từ ${company?.name || "doanh nghiệp"}.`,
      });
      closeCompanyDrawer();
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể từ chối lời mời. Vui lòng thử lại sau.",
      );
      toast.add({ type: "error", description: msg });
    }
  };

  return (
    <Sheet
      open={isDrawerOpen}
      onOpenChange={(open) => {
        if (!open) closeCompanyDrawer();
      }}
    >
      <SheetContent
        side="right"
        className="w-full min-w-150 overflow-y-auto border-l border-border bg-white p-0 pt-10 sm:max-w-md md:max-w-lg"
      >
        {/* Header Drawer */}
        <SheetHeader className="border-b border-border bg-slate-50/50 p-6">
          <div className="flex items-center gap-4">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="size-14 rounded-2xl border border-border bg-white object-cover"
                onError={(e) => {
                  // Fallback khi ảnh lỗi
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-white text-primary">
                <Building2 className="size-7" />
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              <SheetTitle className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {company?.name ||
                  invitationContext?.company?.name ||
                  "Đang tải thông tin..."}
              </SheetTitle>

              <div className="mt-1 flex items-center gap-2">
                {company?.verificationStatus === "Verified" ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="size-3.5" />
                    Đã xác thực
                  </span>
                ) : company?.verificationStatus === "Pending" ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <Clock className="size-3.5" />
                    Chờ duyệt
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                    <AlertCircle className="size-3.5" />
                    Chưa xác thực
                  </span>
                )}

                {company?.taxCode && (
                  <span className="text-xs text-slate-400">
                    MST: {company.taxCode}
                  </span>
                )}
              </div>

              <SheetDescription className="sr-only">
                Thông tin chi tiết và hồ sơ năng lực của doanh nghiệp
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Nội dung chi tiết doanh nghiệp */}
        <div className="flex-1 space-y-6 p-6">
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-200" />
              <div className="h-24 w-full animate-pulse rounded-xl bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-200" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <p className="font-semibold">
                Không thể tải thông tin doanh nghiệp
              </p>
              <p className="mt-1">
                Vui lòng thử lại sau hoặc kiểm tra lại kết nối mạng.
              </p>
              <Button
                variant="secondary"
                onClick={() => refetch()}
                className="mt-3 h-8! px-3! text-xs! font-medium!"
              >
                Tải lại
              </Button>
            </div>
          ) : (
            <>
              {/* Khối ngữ cảnh Lời mời (nếu mở từ trang Lời mời) */}
              {invitationContext && (
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <Calendar className="size-3.5" />
                    Ngữ cảnh lời mời gia nhập
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Ngày gửi lời mời:</span>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {dayjs(invitationContext.createdAt).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Hạn chót phản hồi:</span>
                      <p
                        className={`mt-0.5 font-semibold ${
                          isExpired && isPendingInvitation
                            ? "text-rose-600"
                            : "text-slate-800"
                        }`}
                      >
                        {dayjs(invitationContext.expiresAt).format(
                          "DD/MM/YYYY HH:mm",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3 text-xs">
                    <span className="text-slate-500">Trạng thái hiện tại:</span>
                    {invitationContext.status === "Pending" ? (
                      <span className="font-semibold text-amber-600">
                        {isExpired ? "Hết hạn" : "Đang chờ bạn phản hồi"}
                      </span>
                    ) : invitationContext.status === "Accepted" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="size-3.5" /> Đã chấp nhận
                      </span>
                    ) : invitationContext.status === "Rejected" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                        <XCircle className="size-3.5" /> Đã từ chối
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-500">
                        Hết hiệu lực
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Thông tin liên hệ cơ bản */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Thông tin liên hệ
                </h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  {company?.email && (
                    <div className="flex items-start gap-2.5">
                      <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <a
                          href={`mailto:${company.email}`}
                          className="ml-1.5 font-medium text-slate-800 transition-colors hover:text-primary"
                        >
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {company?.phone && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      <div>
                        <span className="text-slate-400">Số điện thoại:</span>
                        <a
                          href={`tel:${company.phone}`}
                          className="ml-1.5 font-medium text-slate-800 transition-colors hover:text-primary"
                        >
                          {company.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {company?.website && (
                    <div className="flex items-start gap-2.5">
                      <ExternalLink className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <span className="text-slate-400">Website:</span>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1.5 font-medium break-all text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {company?.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                      <div>
                        <span className="text-slate-400">Địa chỉ:</span>
                        <span className="ml-1.5 font-medium text-slate-800">
                          {company.address}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mô tả doanh nghiệp */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  <FileText className="size-3.5" />
                  Giới thiệu doanh nghiệp
                </h4>
                <div className="rounded-xl border border-border bg-slate-50/50 p-4 text-xs leading-relaxed text-slate-700">
                  {company?.description ? (
                    <p className="whitespace-pre-line">{company.description}</p>
                  ) : (
                    <p className="text-slate-400 italic">
                      Doanh nghiệp chưa cập nhật mô tả chi tiết.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer thao tác phản hồi lời mời */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-slate-50 p-4">
          <Button
            variant="secondary"
            onClick={closeCompanyDrawer}
            disabled={isAccepting || isRejecting}
            className="h-9! px-4! text-xs! font-medium!"
          >
            Đóng
          </Button>

          {isPendingInvitation && !isExpired && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={X}
                iconSize={14}
                isLoading={isRejecting}
                disabled={isAccepting || isRejecting}
                onClick={handleReject}
                className="h-9! px-3.5! text-xs! font-medium! text-rose-600! hover:bg-rose-50!"
              >
                Từ chối
              </Button>
              <Button
                variant="primary"
                icon={Check}
                iconSize={14}
                isLoading={isAccepting}
                disabled={isAccepting || isRejecting}
                onClick={handleAccept}
                className="h-9! px-4! text-xs! font-medium!"
              >
                Chấp nhận lời mời
              </Button>
            </div>
          )}

          {invitationContext?.status === "Accepted" && company && (
            <Link
              to={`/recruiter/company-management/${company.id}/overview`}
              onClick={closeCompanyDrawer}
            >
              <Button
                variant="primary"
                icon={ExternalLink}
                iconSize={14}
                className="h-9! px-4! text-xs! font-medium!"
              >
                Xem quản lý công ty
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CompanyDetailDrawer;
