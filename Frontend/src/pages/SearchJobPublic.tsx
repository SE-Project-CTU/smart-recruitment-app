import SearchJobPage from "./candidate/SearchJobPage";

function SearchJob() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-bg px-4 sm:px-6 xl:px-8 pt-28 sm:pt-32 pb-12">
      <div className="w-full max-w-[1720px]">
        <SearchJobPage isPublicPage={true} />
      </div>
    </div>
  );
}

export default SearchJob;
