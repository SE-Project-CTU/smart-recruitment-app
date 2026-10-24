import {
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { MorphIcon } from "morphicons/react";
import { BookmarkCheck, Bookmark } from "lucide";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import Button from "@/components/Button";
import { CompanyLogo } from "./CompanyLogo";
import { useCompanyDetail } from "@/hooks/queries/useCompany";
import { useAuthStore } from "@/stores/authStore";
import type { CompanyItem, CompanyInvitationItem } from "@/types/company";
import dayjs from "dayjs";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  href?: string;
}

function InfoRow({ icon: Icon, label, value, href }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-bg text-text-muted">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-muted">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block truncate text-sm font-medium text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-text-main">{value}</p>
        )}
      </div>
    </div>
  );
}

export interface CompanyDetailDrawerProps {
  company?: CompanyItem | null;
  companyId?: string | null;
  open: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  invitation?: CompanyInvitationItem | null;
  onAcceptInvitation?: (invitation: CompanyInvitationItem) => void;
  onRejectInvitation?: (invitation: CompanyInvitationItem) => void;
  isProcessingInvitation?: boolean;
}

export function CompanyDetailDrawer({
  company: initialCompany,
  companyId,
  open,
  onClose,
  isBookmarked,
  onToggleBookmark,
  invitation,
  onAcceptInvitation,
  onRejectInvitation,
  isProcessingInvitation = false,
}: CompanyDetailDrawerProps) {
  const effectiveId =
    companyId ||
    initialCompany?.id ||
    invitation?.company?.id ||
    invitation?.companyId;

  const { data: fetchedCompany, isLoading } = useCompanyDetail(
    open && effectiveId ? effectiveId : undefined,
  );

  const previewCompany: CompanyItem | null = invitation?.company
    ? {
        id: invitation.company.id,
        name: invitation.company.name,
        verificationStatus: invitation.company.verificationStatus,
        logoUrl: invitation.company.logoUrl ?? null,
        address: invitation.company.address ?? "",
        website: invitation.company.website ?? "",
        taxCode: "",
        email: "",
        phone: "",
        description: "",
        createdAt: "",
        updatedAt: "",
        verifiedAt: null,
      }
    : null;

  const company = fetchedCompany || initialCompany || previewCompany;

  const user = useAuthStore((state) => state.user);
  const isRecruiterOrAdmin = user?.roles?.some(
    (r) => r === "Recruiter" || r === "Admin",
  );
  // Ẩn thông tin xác minh nội bộ đối với Candidate thông thường
  const canSeeVerification = Boolean(
    isRecruiterOrAdmin || company?.membership || invitation,
  );

  if (!open) return null;

  const isPending = invitation?.status === "Pending";
  const isExpired =
    invitation &&
    (invitation.status === "Expired" ||
      dayjs().isAfter(dayjs(invitation.expiresAt)));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full min-w-130 flex-col gap-0 overflow-y-auto p-0 pt-5 backdrop-blur-none sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b border-border p-6 pb-5">
          {isLoading && !company ? (
            <div className="space-y-3 py-4">
              <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ) : company ? (
            <>
              <div className="flex items-start gap-4">
                <CompanyLogo
                  logoUrl={company.logoUrl}
                  name={company.name}
                  size="lg"
                />
                <div className="min-w-0 flex-1 pt-1">
                  <SheetTitle className="text-base leading-snug font-semibold text-text-main">
                    {company.name}
                  </SheetTitle>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {company.taxCode && (
                      <span className="text-xs text-text-muted">
                        MST: {company.taxCode}
                      </span>
                    )}
                    {canSeeVerification && (
                      <>
                        {company.verificationStatus === "Verified" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <ShieldCheck className="size-3" />
                            Đã xác thực
                          </span>
                        )}
                        {company.verificationStatus === "Pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            <Clock className="size-3" />
                            Chờ duyệt
                          </span>
                        )}
                        {company.verificationStatus === "Rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            <AlertCircle className="size-3" />
                            Từ chối
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2.5">
                {company.website && (
                  <Button
                    icon={ExternalLink}
                    className="flex-1!"
                    onClick={() => window.open(company.website, "_blank")}
                  >
                    Truy cập website
                  </Button>
                )}

                {onToggleBookmark && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="secondary"
                          className="p-2.5!"
                          onClick={() => onToggleBookmark(company.id)}
                        >
                          <MorphIcon
                            className="size-4"
                            icon={isBookmarked ? BookmarkCheck : Bookmark}
                          />
                        </Button>
                      }
                    />
                    <TooltipPanel>
                      {isBookmarked ? "Bỏ lưu" : "Lưu"}
                    </TooltipPanel>
                  </Tooltip>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">
              Không tìm thấy thông tin doanh nghiệp
            </p>
          )}
        </SheetHeader>

        {company && (
          <div className="flex-1 space-y-6 p-6">
            {/* Nếu mở trong ngữ cảnh lời mời gia nhập */}
            {invitation && (
              <section className="rounded-2xl border border-border bg-slate-50 p-4 text-xs">
                <h4 className="font-semibold text-slate-700">
                  Thông tin lời mời gia nhập
                </h4>
                <div className="mt-2 space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày gửi:</span>
                    <span className="font-medium text-slate-700">
                      {dayjs(invitation.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hạn phản hồi:</span>
                    <span
                      className={`font-medium ${
                        isExpired ? "text-rose-600" : "text-slate-700"
                      }`}
                    >
                      {dayjs(invitation.expiresAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trạng thái:</span>
                    <span className="font-semibold text-primary">
                      {invitation.status}
                    </span>
                  </div>
                  {invitation.inviter && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Người mời:</span>
                      <span className="font-medium text-slate-700">
                        {invitation.inviter.fullName}
                        {invitation.inviter.email
                          ? ` (${invitation.inviter.email})`
                          : ""}
                      </span>
                    </div>
                  )}
                  {!invitation.inviter && invitation.inviterEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Người mời:</span>
                      <span className="font-medium text-slate-700">
                        {invitation.inviterEmail}
                      </span>
                    </div>
                  )}
                </div>

                {isPending && !isExpired && (
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200/60 pt-3">
                    {onRejectInvitation && (
                      <Button
                        variant="secondary"
                        onClick={() => onRejectInvitation(invitation)}
                        disabled={isProcessingInvitation}
                        className="h-8! px-3! text-xs! font-medium! text-rose-600! ring-status-error! hover:bg-rose-50!"
                      >
                        Từ chối
                      </Button>
                    )}
                    {onAcceptInvitation && (
                      <Button
                        variant="primary"
                        onClick={() => onAcceptInvitation(invitation)}
                        isLoading={isProcessingInvitation}
                        className="h-8! px-3! text-xs! font-medium!"
                      >
                        Chấp nhận lời mời
                      </Button>
                    )}
                  </div>
                )}
              </section>
            )}

            <section>
              <h4 className="mb-2 text-xs font-semibold tracking-widest text-text-muted uppercase">
                Giới thiệu
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-line text-text-main">
                {company.description ||
                  "Doanh nghiệp chưa cập nhật mô tả chi tiết."}
              </p>
            </section>

            <section>
              <h4 className="mb-3 text-xs font-semibold tracking-widest text-text-muted uppercase">
                Thông tin liên hệ
              </h4>
              <div className="flex flex-col gap-3">
                <InfoRow icon={Mail} label="Email" value={company.email} />
                <InfoRow
                  icon={Phone}
                  label="Điện thoại"
                  value={company.phone}
                />
                <InfoRow
                  icon={Globe}
                  label="Website"
                  value={
                    company.website
                      ? company.website.replace(/^https?:\/\//, "")
                      : null
                  }
                  href={company.website || undefined}
                />
                <InfoRow
                  icon={MapPin}
                  label="Địa chỉ"
                  value={company.address}
                />
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CompanyDetailDrawer;
