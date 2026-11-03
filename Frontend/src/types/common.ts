/**
 * Định danh tên cơ bản (dùng cho Province, Ward, Industry, Skill)
 */
export interface NamedSummary {
  id: string;
  name: string;
}

export type ProvinceSummary = NamedSummary;
export type WardSummary = NamedSummary;
export type IndustrySummary = NamedSummary;
export type SkillSummary = NamedSummary;

// Alias tương thích cho Search Item backend
export type SearchJobProvinceSummary = NamedSummary;
export type SearchJobWardSummary = NamedSummary;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T, TMeta = Record<string, unknown>> {
  data: T;
  meta: TMeta;
  correlationId: string;
}

export type ApiPagedResponse<T> = ApiResponse<T[], PaginationMeta>;
