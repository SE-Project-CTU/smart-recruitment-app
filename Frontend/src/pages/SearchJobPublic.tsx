import SearchJobPage from "./candidate/SearchJobPage";
import { useAuthStore } from "@/stores/authStore";

function SearchJob() {
  const { user, isAuthenticated } = useAuthStore();
  const isCandidate =
    isAuthenticated &&
    Boolean(user?.roles?.some((r) => r.toLowerCase() === "candidate"));

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-bg px-4 pt-24 pb-12 sm:px-6 sm:pt-28 xl:px-8">
      <div className="w-full max-w-[1720px]">
        <SearchJobPage isPublicPage={!isCandidate} />
      </div>
    </div>
  );
}

export default SearchJob;
