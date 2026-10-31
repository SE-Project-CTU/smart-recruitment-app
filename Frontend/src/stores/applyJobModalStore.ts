import { create } from "zustand";
import type { MockJobPosting } from "@/constants/mockData";
import type { ApplicationJobSummary } from "@/types/application";
import type {
  JobPostingItem,
  JobPostingResult,
  JobPostingDetailResult,
  JobPostingSearchItem,
} from "@/types/job";
import { extractJobDisplayData } from "@/utils/jobHelpers";

/**
 * Kiểu dữ liệu linh hoạt của Job khi đưa vào Modal Ứng tuyển
 */
export interface ApplyTargetJob {
  id: string;
  title: string;
  company?: {
    name?: string;
    logoUrl?: string | null;
    logoFileUrl?: string | null;
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
    const display = extractJobDisplayData(rawJob);

    // Chuẩn hóa dữ liệu job thành ApplyTargetJob đồng nhất
    const normalized: ApplyTargetJob = {
      id: rawJob.id,
      title: "title" in rawJob ? rawJob.title : "Vị trí tuyển dụng",
      company: {
        name: display.companyName,
        logoUrl: display.companyLogoUrl,
        logoFileUrl: display.companyLogoUrl,
      },
      companyName: display.companyName,
      companyLogoUrl: display.companyLogoUrl,
      salaryRange:
        "salaryRange" in rawJob
          ? (rawJob.salaryRange ?? null)
          : display.salaryText,
      salaryMin: "salaryMin" in rawJob ? (rawJob.salaryMin ?? null) : null,
      salaryMax: "salaryMax" in rawJob ? (rawJob.salaryMax ?? null) : null,
      salaryNegotiable: display.isNegotiable,
      currency: "currency" in rawJob ? (rawJob.currency ?? "VND") : "VND",
      jobType: "jobType" in rawJob ? (rawJob.jobType ?? null) : null,
      workMode: "workMode" in rawJob ? (rawJob.workMode ?? null) : null,
      jobLevel: "jobLevel" in rawJob ? (rawJob.jobLevel ?? null) : null,
      location: {
        provinceName: display.provinceName,
        detailedLocation: display.detailedLocation,
        wardName: display.wardName,
      },
      provinceName: display.provinceName,
    };

    set({ isOpen: true, job: normalized });
  },
  closeApplyModal: () => set({ isOpen: false, job: null }),
}));
