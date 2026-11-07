import SearchJobPage from "./candidate/SearchJobPage";

function SearchJob() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-bg px-4 pt-28 pb-12 sm:px-6 sm:pt-32 xl:px-8">
      <div className="w-full max-w-[1720px]">
        <SearchJobPage isPublicPage={true} />
      </div>
    </div>
  );
}

export default SearchJob;
