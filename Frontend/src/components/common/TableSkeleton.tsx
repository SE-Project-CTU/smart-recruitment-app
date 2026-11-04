import { Skeleton } from "../ui/skeleton";

function TableSkeleton() {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-white shadow-xs">
      <div className="min-w-250">
        {/* Header Skeleton */}
        <div className="grid grid-cols-12 items-center gap-4 border-b border-border bg-slate-50/50 p-4">
          <div className="col-span-3">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="col-span-1 flex justify-end">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Rows Skeleton (Hiển thị 5 dòng giả lập) */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-12 items-center gap-4 border-b border-slate-100 p-4 last:border-none"
          >
            {/* 1. Vị trí & Doanh nghiệp */}
            <div className="col-span-3 flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="w-full space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            {/* 2. Địa điểm & Hình thức */}
            <div className="col-span-2 space-y-2.5">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-3 w-2/3" />
            </div>

            {/* 3. Mức lương */}
            <div className="col-span-2">
              <Skeleton className="h-4 w-28" />
            </div>

            {/* 4. Ngày tạo */}
            <div className="col-span-1">
              <Skeleton className="h-4 w-20" />
            </div>

            {/* 5. Hạn nhận hồ sơ */}
            <div className="col-span-1">
              <Skeleton className="h-4 w-20" />
            </div>

            {/* 6. Trạng thái */}
            <div className="col-span-2">
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            {/* 7. Thao tác */}
            <div className="col-span-1 flex items-center justify-end gap-2.5">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="size-5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { TableSkeleton };
export default TableSkeleton;
