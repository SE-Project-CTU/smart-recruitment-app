import { create } from "zustand";
import type { MockJobPosting } from "@/constants/mockData";
import type { ApplicationJobSummary } from "@/types/application";
import type { JobPostingItem, JobPostingResult, JobPostingDetailResult, JobPostingSearchItem } from "@/types/job";

/**
 * Kiểu dữ liệu linh hoạt của Job khi đưa vào Modal Ứng tuyển
 */
export interface ApplyTargetJob {
  id: string;
  title: string;
  company?: {
    name?: string;
    logoUrl?: string | null;
  };
  companyName?: string;
  companyLogoUrl?: string | null;
  salaryRange?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable?: boolean | null;
  currency?: string | null;
  jobType?: string | null;
  workMode?: string | null;
  jobLevel?: string | null;
  location?: {
    provinceName?: string | null;
    detailedLocation?: string | null;
    wardName?: string | null;
  };
  provinceName?: string | null;
}

export type AnyJob =
  | ApplyTargetJob
  | MockJobPosting
  | ApplicationJobSummary
  | JobPostingItem
  | JobPostingResult
  | JobPostingDetailResult
  | JobPostingSearchItem;

interface ApplyJobModalState {
  isOpen: boolean;
  job: ApplyTargetJob | null;
  openApplyModal: (job: AnyJob) => void;
  closeApplyModal: () => void;
}

export const useApplyJobModalStore = create<ApplyJobModalState>((set) => ({
  isOpen: false,
  job: null,
  openApplyModal: (rawJob) => {
    // Chuẩn hóa dữ liệu job thành ApplyTargetJob đồng nhất
    const normalized: ApplyTargetJob = {
      id: rawJob.id,
      title: "title" in rawJob ? rawJob.title : "Vị trí tuyển dụng",
      company:
        "company" in rawJob && rawJob.company
          ? {
              name: rawJob.company.name,
              logoUrl: rawJob.company.logoUrl ?? null,
            }
          : undefined,
      companyName:
        ("companyName" in rawJob && rawJob.companyName) ||
        ("company" in rawJob && rawJob.company?.name) ||
        "Doanh nghiệp tuyển dụng",
      companyLogoUrl:
        ("companyLogoUrl" in rawJob && rawJob.companyLogoUrl) ||
        ("company" in rawJob && rawJob.company?.logoUrl) ||
        null,
      salaryRange:
        "salaryRange" in rawJob ? (rawJob.salaryRange ?? null) : null,
      salaryMin: "salaryMin" in rawJob ? (rawJob.salaryMin ?? null) : null,
      salaryMax: "salaryMax" in rawJob ? (rawJob.salaryMax ?? null) : null,
      salaryNegotiable:
        "salaryNegotiable" in rawJob
          ? Boolean(rawJob.salaryNegotiable)
          : false,
      currency: "currency" in rawJob ? (rawJob.currency ?? "USD") : "USD",
      jobType: "jobType" in rawJob ? (rawJob.jobType ?? null) : null,
      workMode: "workMode" in rawJob ? (rawJob.workMode ?? null) : null,
      jobLevel: "jobLevel" in rawJob ? (rawJob.jobLevel ?? null) : null,
      location:
        "location" in rawJob && rawJob.location
          ? {
              provinceName: rawJob.location.provinceName ?? null,
              detailedLocation: rawJob.location.detailedLocation ?? null,
              wardName: rawJob.location.wardName ?? null,
            }
          : undefined,
      provinceName:
        ("provinceName" in rawJob && rawJob.provinceName) ||
        ("province" in rawJob && (rawJob as unknown as { province?: { name?: string } }).province?.name) ||
        null,
    };

    set({ isOpen: true, job: normalized });
  },
  closeApplyModal: () => set({ isOpen: false, job: null }),
}));
