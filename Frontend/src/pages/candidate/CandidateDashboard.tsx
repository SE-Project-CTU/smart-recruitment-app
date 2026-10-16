import { useState } from "react";
import { ArrowRight, Briefcase, Clock, MapPin, Search } from "lucide-react";
import { Smarthire_icon_default } from "@/assets/images/logo";
import { CTAMeshGradient } from "@/components/CustomBackground";
import { MOCK_JOB_POSTINGS } from "@/constants/mockData";
import { getTimeAgo } from "@/utils/helper";
import Button from "@/components/Button";
function CandidateDashboard() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [category, setCategory] = useState("cntt");
  const [location, setLocation] = useState("hanoi");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // sau này nối api hoặc là chuyển qua trang seearch việc làm luôn fucking shit
    console.log("Searching with:", { searchKeyword, category, location });
  };

  const job = MOCK_JOB_POSTINGS[0];
  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* CTA Header Banner */}
      <div className="relative flex min-h-65 w-full overflow-hidden rounded-3xl p-8 md:p-12">
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

      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1>${job.salaryNegotiable ? "Thỏa thuận" : job.salaryMax}</h1>
          <p>{getTimeAgo(job.createAt)}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p>{job.title}</p>
            <p>{job.company.name}</p>
          </div>
          <img src={job.company.logoUrl} alt="" className="max-w-20" />
        </div>
        <div className="flex flex-col">
          <div>
            <MapPin />
            <p>{`${job.location.wardName}, ${job.location.provinceName}`}</p>
          </div>
          <div>
            <Clock />
            <p>{job.jobType}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div>{job.jobLevel}</div>
          <div>{job.workMode}</div>
          <div>YOE {job.experienceYears}+</div>
        </div>

        <div className="flex">
          <Button>Ứng tuyển ngay</Button>
          <Button variant="secondary">Lưu tin</Button>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
