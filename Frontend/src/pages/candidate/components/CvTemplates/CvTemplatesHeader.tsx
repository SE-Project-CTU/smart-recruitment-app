import React from "react";
import { Search, X, LayoutTemplate } from "lucide-react";

interface CvTemplatesHeaderProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onClearSearch: () => void;
}

export const CvTemplatesHeader: React.FC<CvTemplatesHeaderProps> = ({
  searchKeyword,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-bg border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="size-6 text-primary" />
          <h1 className="text-xl font-bold text-text-main md:text-2xl">
            Kho mẫu CV chuẩn tuyển dụng
          </h1>
        </div>
        <p className="text-xs text-text-muted md:text-sm">
          Khám phá các thiết kế CV chuẩn ATS giúp tối ưu hóa khả năng trúng tuyển của bạn.
        </p>
      </div>

      {/* Ô tìm kiếm mẫu */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Tìm theo tên mẫu CV..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface py-2 pr-3 pl-9 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
        {searchKeyword && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main"
            title="Xóa tìm kiếm"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
