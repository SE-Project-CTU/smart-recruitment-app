import { Building2, Check, X } from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/Button";
import type { CompanyInvitationItem } from "@/types/company";

interface InvitationCardProps {
  invitation: CompanyInvitationItem;
  onAccept?: (invitation: CompanyInvitationItem) => void;
  onReject?: (invitation: CompanyInvitationItem) => void;
  isProcessing?: boolean;
}

export function InvitationCard({
  invitation,
  onAccept,
  onReject,
  isProcessing = false,
}: InvitationCardProps) {
  const companyName = invitation.company?.name || "Doanh nghiệp";
  const isPending = invitation.status === "Pending";
  const isExpired =
    invitation.status === "Expired" ||
    dayjs().isAfter(dayjs(invitation.expiresAt));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-slate-50 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h4 className="truncate text-sm font-semibold text-slate-900">
            {companyName}
          </h4>
          <span className="text-[11px] text-slate-400">
            Gửi lúc: {dayjs(invitation.createdAt).format("DD/MM/YYYY HH:mm")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
        <span className="text-slate-500">
          Hạn: {dayjs(invitation.expiresAt).format("DD/MM/YYYY")}
        </span>
        {isPending && !isExpired && (
          <div className="flex items-center gap-2">
            {onAccept && (
              <Button
                variant="primary"
                icon={Check}
                iconSize={13}
                isLoading={isProcessing}
                onClick={() => onAccept(invitation)}
                className="h-7! px-2.5! text-xs! font-medium!"
              >
                Chấp nhận
              </Button>
            )}
            {onReject && (
              <Button
                variant="secondary"
                icon={X}
                iconSize={13}
                disabled={isProcessing}
                onClick={() => onReject(invitation)}
                className="h-7! px-2.5! text-xs! font-medium! text-rose-600!"
              >
                Từ chối
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvitationCard;
