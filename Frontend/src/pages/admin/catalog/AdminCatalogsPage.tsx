import { useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Sparkles,
  MapPin,
  FileText,
} from "lucide-react";
import { IndustryCatalogTab } from "./tabs/IndustryCatalogTab";

type CatalogTabKey = "industries" | "skills" | "locations" | "cv-templates";

interface TabItem {
  key: CatalogTabKey;
  label: string;
  icon: typeof Briefcase;
  description: string;
}

const CATALOG_TABS: TabItem[] = [
  {
    key: "industries",
    label: "Ngành nghề",
    icon: Briefcase,
    description: "Nhóm ngành và ngành nghề trực thuộc",
  },
  {
    key: "skills",
    label: "Kỹ năng",
    icon: Sparkles,
    description: "Ngân hàng kỹ năng chuyên môn",
  },
  {
    key: "locations",
    label: "Địa bàn",
    icon: MapPin,
    description: "Tỉnh/Thành phố và Phường/Xã",
  },
  {
    key: "cv-templates",
    label: "Mẫu CV",
    icon: FileText,
    description: "Kho mẫu CV chuẩn hóa sàn",
  },
];

export function AdminCatalogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: CatalogTabKey =
    rawTab === "skills" ||
    rawTab === "locations" ||
    rawTab === "cv-templates"
      ? rawTab
      : "industries";

  const handleSelectTab = (tabKey: CatalogTabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tabKey);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-text-main sm:text-2xl">
          Quản lý danh mục chung
        </h1>
        <p className="text-xs text-text-muted sm:text-sm">
          Cấu hình chuẩn hóa các danh mục ngành nghề, kỹ năng, địa bàn hành chính và mẫu CV toàn hệ thống.
        </p>
      </div>

      {/* MASTER TAB BAR */}
      <div className="border-b border-border">
        <nav className="flex space-x-2 overflow-x-auto pb-2" aria-label="Tabs">
          {CATALOG_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleSelectTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-secondary-light text-primary"
                    : "text-text-muted hover:bg-slate-100 hover:text-text-main"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENTS */}
      <div>
        {activeTab === "industries" && <IndustryCatalogTab />}

        {activeTab === "skills" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <Sparkles className="size-8 text-primary/40 mb-2" />
            <p className="text-sm font-semibold text-text-main">
              Quản lý kho Kỹ năng chuyên môn
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Mô-đun quản lý Kỹ năng (Phase 5.2) sẵn sàng triển khai tiếp theo.
            </p>
          </div>
        )}

        {activeTab === "locations" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <MapPin className="size-8 text-primary/40 mb-2" />
            <p className="text-sm font-semibold text-text-main">
              Quản lý Địa bàn hành chính
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Mô-đun Tỉnh/Thành phố & Phường/Xã (Phase 5.3) sẵn sàng triển khai tiếp theo.
            </p>
          </div>
        )}

        {activeTab === "cv-templates" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <FileText className="size-8 text-primary/40 mb-2" />
            <p className="text-sm font-semibold text-text-main">
              Quản lý Mẫu CV chuẩn hóa
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Mô-đun Quản lý Mẫu CV (Phase 5.4) sẵn sàng triển khai tiếp theo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminCatalogsPage;

