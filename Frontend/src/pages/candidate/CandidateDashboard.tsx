import { useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  MapPin,
  PackageOpen,
  Search,
} from "lucide-react";
import { Smarthire_icon_default } from "@/assets/images/logo";
import { CTAMeshGradient } from "@/components/CustomBackground";
import { MOCK_CVS, MOCK_JOB_POSTINGS } from "@/constants/mockData";
import { JobCard } from "@/components/JobCard";
import Button from "@/components/Button";
import {
  Toggle,
  ToggleGroup,
} from "@/components/animate-ui/components/base/toggle-group";
import { ApplicationTrackingTable } from "@/components/ApplicationTrackingTable";
import { CandidateCVSection } from "@/components/CandidateCVSection";
// import { ScrollFade } from "@animate-ui/react/primitives/effects/scroll-fade";

const level = ["Intern", "Fresher", "Junior", "Middle", "Senior", "Executive"];

function CandidateDashboard() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [category, setCategory] = useState("cntt");
  const [location, setLocation] = useState("hanoi");

  const [selectedLevel, setSelectedLevel] = useState<string[]>(["all"]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLevelChange = (newValue: string[]) => {
    if (!newValue || newValue.length === 0) {
      setSelectedLevel(["all"]);
    } else {
      const latestSelected = newValue[newValue.length - 1];
      setSelectedLevel([latestSelected]);
    }
  };

  const activeFilter = selectedLevel[0] || "all";
  const filteredJobs = MOCK_JOB_POSTINGS.filter((job) => {
    if (activeFilter === "all") return true;
    return job.jobLevel.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching with:", { searchKeyword, category, location });
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-8">
      <div className="relative flex min-h-65 w-full overflow-hidden rounded-3xl p-8 lg:p-10 xl:p-12">
        <CTAMeshGradient />

        <div className="relative z-10 flex w-full items-center justify-between gap-8">
          <div className="flex max-w-3xl flex-col gap-6">
            <div className="flex flex-col gap-2 text-white">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                Tìm kiếm cơ hội việc làm ngay hôm nay!
              </h1>
              <p className="text-sm font-normal text-slate-200/90 md:text-base">
                Khám phá hơn 12,500+ việc làm với đãi ngộ cạnh tranh được tối ưu
                riêng cho hồ sơ chuyên môn của bạn.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex w-full items-center rounded-full bg-white p-2 shadow-xl"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3">
                <Search className="size-5 shrink-0 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Vị trí tuyển dụng, kỹ năng, công ty..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="h-6 w-px bg-slate-200" />

              <div className="hidden flex-1 items-center gap-2.5 px-3 sm:flex">
                <Briefcase className="size-5 shrink-0 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="cntt">Công nghệ thông tin</option>
                  <option value="marketing">Marketing / Truyền thông</option>
                  <option value="finance">Tài chính / Ngân hàng</option>
                  <option value="design">Thiết kế / UI-UX</option>
                </select>
              </div>

              <div className="hidden h-6 w-px bg-slate-200 sm:block" />

              <div className="hidden flex-1 items-center gap-2.5 px-3 md:flex">
                <MapPin className="size-5 shrink-0 text-slate-400" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="hanoi">Hà Nội</option>
                  <option value="hcm">Thành phố Hồ Chí Minh</option>
                  <option value="cantho">Cần Thơ</option>
                  <option value="danang">Đà Nẵng</option>
                </select>
              </div>

              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md transition-all hover:bg-primary-dark active:scale-95"
              >
                <ArrowRight className="size-5" />
              </button>
            </form>
          </div>

          <div className="hidden shrink-0 opacity-90 lg:block">
            <img
              src={Smarthire_icon_default}
              alt="SmartHire Icon"
              className="h-32 w-auto object-contain drop-shadow-md lg:h-40"
            />
          </div>
        </div>
      </div>

      {/* jobbbbssss */}
      <div className="flex flex-col gap-4 rounded-2xl bg-bg p-4">
        <div className="flex flex-col items-start gap-3">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-semibold text-text-main">
              Việc làm gợi ý
            </h2>

            <Button
              variant="secondary"
              icon={ArrowRight}
              iconPosition="right"
              iconSize={14}
              className="px-3! py-1.5! text-xs!"
            >
              Xem tất cả gợi ý
            </Button>
          </div>

          <ToggleGroup
            value={selectedLevel}
            onValueChange={handleLevelChange}
            className="gap-1! bg-bg-white-blue p-1!"
          >
            <Toggle className="text-xs!" value="all">
              Tất cả
            </Toggle>
            {level.map((level) => (
              <Toggle className="text-xs!" value={level.toLocaleLowerCase()}>
                {level}
              </Toggle>
            ))}
          </ToggleGroup>
        </div>

        <div className="scrollbar-hide flex w-full min-w-0 flex-nowrap gap-2 overflow-x-auto pb-2">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((item) => (
              <div key={item.id} className="shrink-0">
                <JobCard job={item} />
              </div>
            ))
          ) : (
            <div className="flex min-h-80.5 w-full max-w-85 min-w-70 flex-col items-center justify-between rounded-3xl border-2 border-dashed border-border bg-white/60 p-6 text-center">
              <PackageOpen
                className="mt-4 animate-bounce"
                size={32}
                strokeWidth={1}
              />

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-bold text-text-main">
                  Hiện tại chưa có gợi ý phù hợp
                </h3>
                <p className="text-xs leading-relaxed text-text-muted">
                  Chưa tìm thấy công việc nào khớp với hồ sơ của bạn. Hãy bắt
                  đầu bằng cách tìm kiếm ngay!
                </p>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Button
                  variant="primary"
                  icon={Search}
                  iconSize={15}
                  onClick={handleFocusSearch}
                  className="w-full! py-2.5! text-xs!"
                >
                  Bắt đầu tìm kiếm
                </Button>

                {activeFilter !== "all" && (
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedLevel(["all"])}
                    className="w-full! text-xs!"
                  >
                    Xem tất cả cấp bậc
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* theo doi hồ sơ */}
      <div className="flex flex-col gap-4 rounded-2xl bg-bg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-main">
            Theo dõi hồ sơ
          </h2>
        </div>
        <ApplicationTrackingTable />
      </div>

      {/* danh sach cv */}
      <CandidateCVSection cvList={MOCK_CVS} />
    </div>
  );
}

export default CandidateDashboard;
