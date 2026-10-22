import {
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
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
import type { CompanyItem } from "@/constants/mockData";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}

function InfoRow({ icon: Icon, label, value, href }: InfoRowProps) {
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
  company: CompanyItem | null;
  open: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export function CompanyDetailDrawer({
  company,
  open,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: CompanyDetailDrawerProps) {
  if (!company) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 pt-5 backdrop-blur-none sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b border-border p-6 pb-5">
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
              <p className="mt-0.5 text-xs text-text-muted">
                MST: {company.taxCode}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <Button
              icon={ExternalLink}
              className="flex-1!"
              onClick={() => window.open(company.website, "_blank")}
            >
              Truy cập website
            </Button>
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
              <TooltipPanel>{isBookmarked ? "Bỏ lưu" : "Lưu"}</TooltipPanel>
            </Tooltip>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 p-6">
          <section>
            <h4 className="mb-2 text-xs font-semibold tracking-widest text-text-muted uppercase">
              Giới thiệu
            </h4>
            <p className="text-sm leading-relaxed text-text-main">
              {company.description}
            </p>
          </section>

          <section>
            <h4 className="mb-3 text-xs font-semibold tracking-widest text-text-muted uppercase">
              Thông tin liên hệ
            </h4>
            <div className="flex flex-col gap-3">
              <InfoRow icon={Mail} label="Email" value={company.email} />
              <InfoRow icon={Phone} label="Điện thoại" value={company.phone} />
              <InfoRow
                icon={Globe}
                label="Website"
                value={company.website.replace(/^https?:\/\//, "")}
                href={company.website}
              />
              <InfoRow icon={MapPin} label="Địa chỉ" value={company.address} />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
