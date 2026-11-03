import { Skeleton } from "../ui/skeleton";

function JobCardSkeleton() {
  return (
    <div className="flex w-full max-w-85 min-w-70 flex-col justify-between rounded-3xl border border-border bg-white p-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="size-6 rounded-full" />
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-3/5 rounded-md" />
          </div>
          <Skeleton className="size-14 shrink-0 rounded-2xl" />
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-22 rounded-full" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-11 flex-1 rounded-full" />
        <Skeleton className="size-11 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export default JobCardSkeleton;
