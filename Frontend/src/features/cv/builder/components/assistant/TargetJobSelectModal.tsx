import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  CircleDollarSign,
  Clock,
  Check,
  Sparkles,
  FileText,
  Gift,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/common";
import { MOCK_TARGET_JOBS } from "./mockData";
import type { TargetJobOption } from "./types";

interface TargetJobSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: TargetJobOption | null;
  onConfirm: (job: TargetJobOption | null) => void;
}

export const TargetJobSelectModal: React.FC<TargetJobSelectModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  onConfirm,
}) => {
  // Lựa chọn tạm thời trong phiên mở modal (chỉ lưu khi bấm Xác nhận)
  const [tempSelected, setTempSelected] = useState<TargetJobOption | null>(
    selectedJob || MOCK_TARGET_JOBS[0] || null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Đồng bộ lại lựa chọn tạm mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedJob || MOCK_TARGET_JOBS[0] || null);
      setSearchQuery("");
    }
  }, [isOpen, selectedJob]);

  // Lọc danh sách công việc theo từ khóa tìm kiếm
  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_TARGET_JOBS;
    return MOCK_TARGET_JOBS.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.skills?.some((sk) => sk.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  const handleSelectJob = (job: TargetJobOption) => {
    setTempSelected(job);
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    onClose();
  };

  const handleClearSelection = () => {
    setTempSelected(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="max-w-5xl! w-[92vw]! h-[86vh]! max-h-[720px]! p-0! gap-0! overflow-hidden flex flex-col rounded-2xl! border-border! bg-surface! shadow-2xl!"
      >
        {/* ================= 1. HEADER MODAL ================= */}
        <DialogHeader className="border-b border-border/70 px-5 py-3.5 bg-surface shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Briefcase className="size-4" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-sm font-bold text-text-main">
                Chọn vị trí công việc mục tiêu
              </DialogTitle>
              <DialogDescription className="text-[11px] text-text-muted">
                Đối chiếu và tối ưu hóa nội dung CV theo bản mô tả công việc (JD) thực tế
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ================= 2. BODY 2 CỘT (LIST CHỌN & JOB DETAIL) ================= */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* CỘT TRÁI: DANH SÁCH CHỌN CÔNG VIỆC (~380px) */}
          <div className="flex w-full md:w-[380px] shrink-0 flex-col border-r border-border bg-bg/40">
            {/* Thanh tìm kiếm */}
            <div className="border-b border-border/60 bg-surface/80 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Tìm theo chức danh, công ty, kỹ năng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg py-1.5 pl-8.5 pr-3 text-xs text-text-main placeholder:text-text-muted/70 focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>
            </div>

            {/* Danh sách thẻ chọn job */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredJobs.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-muted">
                  Không tìm thấy công việc phù hợp với &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = tempSelected?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      className={`group relative flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/8 shadow-xs ring-1 ring-primary/30"
                          : "border-border bg-surface hover:border-primary/40 hover:bg-bg/50"
                      }`}
                    >
                      {/* Radio indicator */}
                      <div
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-surface group-hover:border-primary/60"
                        }`}
                      >
                        {isSelected && <Check className="size-2.5 stroke-[3]" />}
                      </div>

                      {/* Thông tin vắn tắt */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-text-main leading-snug line-clamp-1">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-text-muted">
                          <Building2 className="size-3 text-text-muted/70 shrink-0" />
                          <span className="font-medium truncate max-w-[170px]">
                            {job.companyName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-text-muted">
                          {job.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="size-2.5" />
                              <span className="truncate max-w-[110px]">{job.location}</span>
                            </span>
                          )}
                          {job.salaryText && (
                            <span className="font-semibold text-status-success">
                              {job.salaryText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT CÔNG VIỆC MỤC TIÊU (JOB DETAIL PREVIEW) */}
          <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-surface min-w-0">
            {tempSelected ? (
              <div className="flex h-full flex-col overflow-hidden">
                {/* Header chi tiết Job */}
                <div className="border-b border-border/70 p-5 bg-gradient-to-b from-primary/5 to-surface shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-text-main leading-tight">
                        {tempSelected.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="font-semibold text-primary">
                          {tempSelected.companyName}
                        </span>
                        <span>•</span>
                        <span>{tempSelected.location}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary shrink-0">
                      Đang xem chi tiết
                    </span>
                  </div>

                  {/* Pills thông tin nhanh */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-[11px]">
                    {tempSelected.salaryText && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-status-success/30 bg-status-success/10 px-2.5 py-1 font-semibold text-status-success">
                        <CircleDollarSign className="size-3.5" />
                        {tempSelected.salaryText}
                      </span>
                    )}
                    {tempSelected.experienceLevel && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg px-2.5 py-1 font-medium text-text-main">
                        <Briefcase className="size-3.5 text-text-muted" />
                        {tempSelected.experienceLevel}
                      </span>
                    )}
                    {tempSelected.workMode && (
                      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg px-2.5 py-1 font-medium text-text-main">
                        <Clock className="size-3.5 text-text-muted" />
                        {tempSelected.workMode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nội dung chi tiết (Cuộn độc lập) */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-text-main">
                  {/* 1. Kỹ năng yêu cầu */}
                  {tempSelected.skills && tempSelected.skills.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                        <Sparkles className="size-3.5 text-primary" />
                        Kỹ năng chuyên môn yêu cầu
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {tempSelected.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Mô tả tổng quan */}
                  {tempSelected.description && (
                    <div className="space-y-1.5">
                      <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                        <FileText className="size-3.5 text-primary" />
                        Mô tả công việc
                      </h5>
                      <p className="leading-relaxed text-text-muted">
                        {tempSelected.description}
                      </p>
                    </div>
                  )}

                  {/* 3. Trách nhiệm chính */}
                  {tempSelected.responsibilities &&
                    tempSelected.responsibilities.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                          <CheckCircle2 className="size-3.5 text-status-success" />
                          Trách nhiệm công việc
                        </h5>
                        <ul className="space-y-1.5 pl-1 text-text-muted">
                          {tempSelected.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* 4. Yêu cầu ứng viên */}
                  {tempSelected.requirements &&
                    tempSelected.requirements.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                          <Briefcase className="size-3.5 text-primary" />
                          Yêu cầu ứng viên
                        </h5>
                        <ul className="space-y-1.5 pl-1 text-text-muted">
                          {tempSelected.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-status-warning mt-0.5">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* 5. Chế độ đãi ngộ & Quyền lợi */}
                  {tempSelected.benefits && tempSelected.benefits.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                        <Gift className="size-3.5 text-status-success" />
                        Chế độ đãi ngộ
                      </h5>
                      <ul className="space-y-1.5 pl-1 text-text-muted">
                        {tempSelected.benefits.map((bene, i) => (
                          <li key={i} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-status-success mt-0.5">•</span>
                            <span>{bene}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center text-text-muted">
                <Briefcase className="size-10 text-text-muted/50 mb-2" />
                <p className="text-xs font-semibold text-text-main">
                  Chưa chọn công việc nào
                </p>
                <p className="text-[11px] max-w-[220px] mt-1">
                  Nhấn vào một công việc ở danh sách bên trái để xem mô tả và yêu cầu chi tiết
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ================= 3. FOOTER MODAL ================= */}
        <div className="flex items-center justify-between border-t border-border/70 bg-bg/50 px-5 py-3 shrink-0">
          <div>
            {tempSelected ? (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] font-semibold text-text-muted hover:text-status-error transition-colors cursor-pointer"
              >
                Bỏ chọn vị trí này
              </button>
            ) : (
              <span className="text-[11px] text-text-muted">
                Chưa chọn công việc nào
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="rounded-lg! px-3.5! py-1.5! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={!tempSelected}
              onClick={handleConfirm}
              className="rounded-lg! px-4! py-1.5! text-xs! font-semibold!"
            >
              Xác nhận chọn công việc này
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
