import { Skeleton } from "../ui/skeleton";

function JobCardSkeleton() {
  return (
    <div className="flex w-full min-h-70 sm:min-h-74 flex-col justify-between rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 sm:h-6 w-28 rounded-md" />
          <Skeleton className="size-6 rounded-full" />
        </div>

        <div className="mt-3.5 sm:mt-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-4/5 rounded-md" />
            <Skeleton className="h-3.5 w-3/5 rounded-md" />
          </div>
          <Skeleton className="size-11 sm:size-12 shrink-0 rounded-xl" />
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-3.5 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-40 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-3.5 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-18 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="size-9 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

export default JobCardSkeleton;
