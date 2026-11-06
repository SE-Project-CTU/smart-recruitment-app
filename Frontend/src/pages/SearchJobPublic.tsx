import SearchJobPage from "./candidate/SearchJobPage";

function SearchJob() {
  return (
    <div className="flex h-full w-full bg-bg px-6 pt-32">
      <SearchJobPage isPublicPage={true} />
    </div>
  );
}

export default SearchJob;
