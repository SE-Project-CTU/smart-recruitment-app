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
