import {
  CandidateMatching,
  Elipse,
  HumanImage,
  OfficeGirl,
  Rectangle_1,
  Rectangle_2,
  Rectangle_3,
} from "@/assets/images/decoration";
import { SmartHire_default, SmartHire_text_only } from "@/assets/images/logo";
import Button from "@/components/Button";
import TextType from "@/components/external/TextType";
import CountUp from "@/components/external/CountUp";
import {
  SlidingLogoMarquee,
  ThreeDScrollTrigger,
  ThreeDScrollTriggerContainer,
  CoolSlideGallery,
} from "@/components/lightswind";
import { imageSlide, logoItems } from "@/constants/LandingpageConsts";
import {
  BuildingComplexIcon,
  ChartBarStackedIcon,
  FileTextIcon,
  LightbulbIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import TestimonialCard from "@/components/TestimonialCard";
import { testimonialData } from "@/constants/mockData";

const HeroSection = () => {
  return (
    <section className="overflow-bg-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg-white-blue pt-28 pb-16 lg:pt-32">
      <div className="container mx-auto max-w-350 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row lg:gap-60">
          <div className="z-10 flex w-full flex-col gap-6 text-center lg:w-1/2 lg:gap-8 lg:text-left">
            <h1 className="text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl xl:text-7xl">
              <span>Make the impossible</span>
              <span className="mt-2 block">
                to the{" "}
                <TextType
                  text={["possible"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor
                  cursorCharacter="_"
                  deletingSpeed={50}
                  className="inline-block text-secondary-dark"
                  variableSpeed={undefined}
                  onSentenceComplete={undefined}
                />
              </span>
            </h1>

            <div className="text-text mx-auto w-full max-w-2xl space-y-4 lg:mx-0">
              <p className="text-xl font-medium tracking-tighter lg:text-2xl">
                Nâng tầm sự nghiệp và kết nối nhân tài trong kỷ nguyên AI.
              </p>
              <p className="text-sm text-text-muted lg:text-base">
                SmartHire ứng dụng trí tuệ nhân tạo thế hệ mới giúp tối ưu hóa
                quy trình tuyển dụng, kết nối ứng viên tiềm năng với doanh
                nghiệp hàng đầu một cách nhanh chóng, chính xác và hiệu quả vượt
                trội.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button
                text="Bắt đầu ngay"
                className="w-fit! px-8! py-4! text-xl!"
              />
            </div>
          </div>

          <div className="relative z-10 mt-10 flex justify-center lg:mt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
              <img
                src={HumanImage}
                alt="SmartHire Team"
                className="relative z-10 h-auto rounded-3xl object-cover shadow-lg md:max-w-70 xl:max-w-90"
              />

              <img
                src={Elipse}
                alt=""
                className="pointer-events-none absolute -top-12 -right-12 z-0 w-32 md:block lg:-top-20 lg:-right-20 lg:w-48 xl:w-64"
              />
              <img
                src={Rectangle_3}
                alt=""
                className="pointer-events-none absolute -top-8 -left-8 z-20 w-24 md:block lg:-top-12 lg:-left-14 lg:w-40"
              />
              <img
                src={Rectangle_1}
                alt=""
                className="pointer-events-none absolute -bottom-10 -left-12 z-0 w-48 md:block lg:-bottom-14 lg:-left-30 lg:w-72 xl:w-92"
              />
              <img
                src={Rectangle_2}
                alt=""
                className="pointer-events-none absolute -right-16 bottom-12 z-20 w-32 opacity-90 md:block lg:-right-32 lg:bottom-24 lg:w-50"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const NumberProof = () => {
  return (
    <section className="flex h-fit w-full flex-col items-center justify-center bg-primary-dark px-5 py-20 md:px-40">
      <div className="mb-12 flex w-full items-center justify-between">
        <p className="font-semibold text-white">SmartHire By The Numbers</p>
        <Button text="Tìm hiểu thêm" type="outline" />
      </div>
      <div className="grid w-full grid-cols-2 grid-rows-2 gap-10 text-white md:grid-cols-4 md:grid-rows-1">
        <div className="flex flex-col gap-2">
          <span className="text-4xl font-bold md:text-5xl lg:text-6xl">
            <CountUp from={0} to={500} onStart={undefined} onEnd={undefined} />
            K+
          </span>
          <span className="text-xs text-stone-300 md:text-sm lg:text-lg">
            Ứng viên tin dùng & tạo CV chuẩn ATS mỗi tháng{" "}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-4xl font-bold md:text-5xl lg:text-6xl">
            <CountUp
              from={0}
              to={10000}
              separator=","
              onStart={undefined}
              onEnd={undefined}
              className="text-secondary"
            />
            +
          </span>
          <span className="text-xs text-stone-300 md:text-sm lg:text-lg">
            Doanh nghiệp hàng đầu đăng tin tuyển dụng
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-4xl font-bold md:text-5xl lg:text-6xl">
            <CountUp from={0} to={94} onStart={undefined} onEnd={undefined} />%
          </span>
          <span className="text-xs text-stone-300 md:text-sm lg:text-lg">
            Tỷ lệ hồ sơ vượt qua hệ thống quét lọc ATS tự động
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-4xl font-bold md:text-5xl lg:text-6xl">
            <CountUp
              from={0}
              to={200}
              onStart={undefined}
              onEnd={undefined}
              className="text-secondary"
            />
            <span className="text-secondary">M</span>+
          </span>
          <span className="text-xs text-stone-300 md:text-sm lg:text-lg">
            Lượt tương tác và kết nối hồ sơ nghề nghiệp thành công
          </span>
        </div>
      </div>
      <div className="my-10 h-px w-full bg-border/70"></div>
      <span className="mb-6 text-center text-sm font-semibold text-stone-300 uppercase">
        Được tin dùng bởi các tập đoàn và doanh nghiệp hàng đầu
      </span>
      <SlidingLogoMarquee items={logoItems} speed={5} />
    </section>
  );
};

const Features = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-12 bg-bg px-4 py-16 sm:px-6 md:py-30 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <h1 className="section-title">Tính Năng Vượt Trội</h1>
        <p className="text-center text-sm leading-relaxed text-text-muted sm:text-base">
          Hệ sinh thái thông minh giúp sàng lọc ứng viên chính xác, tối ưu CV
          vượt chuẩn ATS và rút ngắn 70% thời gian tuyển dụng.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center justify-items-center gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="order-1 flex w-full flex-col items-center space-y-4 md:space-y-12 lg:order-1 lg:items-end">
          <div className="flex w-full max-w-md gap-4 rounded-2xl bg-primary p-6 shadow-md">
            <div className="h-fit w-fit shrink-0 rounded-xl bg-secondary/20 p-4">
              <FileTextIcon className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-white">
              <h2 className="mb-1 text-lg font-semibold">Tối Ưu CV Bằng AI</h2>
              <p className="text-sm leading-relaxed text-stone-200">
                Tự động chuẩn hóa cấu trúc ATS, tối ưu từ khóa và chấm điểm hồ
                sơ theo thời gian thực.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-md gap-4 rounded-2xl bg-status-active p-6 shadow-md">
            <div className="h-fit w-fit shrink-0 rounded-xl bg-[#88d7fb] p-4">
              <BuildingComplexIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-primary">
              <h2 className="mb-1 text-lg font-semibold">
                Đăng Tuyển Không Giới Hạn
              </h2>
              <p className="text-sm leading-relaxed text-primary/90">
                Mô hình mở không giới hạn chỉ tiêu tin tuyển dụng, giúp doanh
                nghiệp tiết kiệm đến 70% ngân sách nhân sự.
              </p>
            </div>
          </div>
        </div>

        <div className="order-3 flex w-full justify-center py-4 lg:order-2 lg:py-0">
          <img
            src={CandidateMatching}
            alt="Candidate Matching"
            className="h-auto w-full max-w-xs object-contain drop-shadow-xl sm:max-w-sm lg:max-w-md"
          />
        </div>

        <div className="order-4 flex w-full flex-col items-center space-y-4 md:space-y-12 lg:order-3 lg:items-start">
          <div className="flex w-full max-w-md gap-4 rounded-2xl bg-[#fbbf24] p-6 shadow-md">
            <div className="h-fit w-fit shrink-0 rounded-xl bg-[#fdd97c] p-4">
              <LightbulbIcon className="h-6 w-6 text-[#78350f]" />
            </div>
            <div className="text-[#78350f]">
              <h2 className="mb-1 text-lg font-semibold">
                Ghép Đôi Thông Minh
              </h2>
              <p className="text-sm leading-relaxed text-[#78350f]/90">
                Thuật toán AI độc quyền khớp đúng kỹ năng, mức lương kỳ vọng và
                môi trường văn hóa doanh nghiệp.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-md gap-4 rounded-2xl bg-[#0284c7] p-6 shadow-md">
            <div className="h-fit w-fit shrink-0 rounded-xl bg-[#359dd2] p-4">
              <ChartBarStackedIcon className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h2 className="mb-1 text-lg font-semibold">
                Phân Tích Dữ Liệu Thời Gian Thực
              </h2>
              <p className="text-sm leading-relaxed text-stone-200">
                Báo cáo thị trường lương, chỉ số năng lực theo ngành và tiến độ
                tuyển dụng trực quan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CVTemplate = () => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const cardWidth = isDesktop ? 443 : 354;
  const cardHeight = isDesktop ? 625 : 500;
  return (
    <div className="flex flex-col gap-8 overflow-hidden bg-bg-white-blue px-4 py-16 sm:px-6 md:gap-20 md:py-30 lg:px-8">
      <div className="space-y-4">
        <Button
          type="secondary"
          text="Bộ sưu tập mẫu CV"
          className="text-xs!"
        />
        <h1 className="section-title">Thư Viện CV Chuẩn Khổng Lồ</h1>
      </div>

      <CoolSlideGallery
        slides={imageSlide}
        autoplay
        cardWidth={cardWidth}
        cardHeight={cardHeight}
      />
    </div>
  );
};

const HitDifferent = () => {
  return (
    <div className="relative flex w-full flex-col gap-8 overflow-hidden bg-bg-stone px-4 py-16 sm:px-6 md:gap-20 md:py-30 lg:px-8">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(125% 125% at 50% 10%, #ffffff 30%, #6fc3e8 100%)
      `,
          backgroundSize: "100% 100%",
        }}
      />

      <div className="z-1 space-y-2 text-center">
        <Button text="Nổi bật" type="secondary" className="text-xs!" />
        <h1 className="section-title">Khác Biệt Làm Nên SmartHire</h1>
        <p className="w-full text-center text-sm md:text-base">
          Đặt lên bàn cân để thấy SmartHire giúp bạn tiết kiệm thời gian và nâng
          cao chất lượng tuyển dụng ra sao.
        </p>
      </div>

      <div className="z-1 mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="flex h-full flex-col justify-between gap-6 rounded-2xl border-8 border-white bg-bg-stone px-8 py-10 shadow-lg">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold md:text-2xl">
                Tuyển dụng truyền thống
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-text-muted md:text-sm">
                Nhiều quy trình phụ thuộc vào thao tác thủ công, tốn thời gian
                và dễ bỏ lỡ ứng viên tiềm năng.
              </p>
            </div>
            <div className="h-px w-full bg-stone-300"></div>
          </div>

          <div className="flex flex-1 items-center rounded-2xl bg-white">
            <ul className="flex h-full w-full list-disc flex-col justify-between p-8 text-sm md:p-12 md:text-base">
              <li>Đánh giá CV thủ công, tốn hàng giờ sàng lọc</li>
              <li>Phản hồi ứng viên chậm, dễ mất ứng viên giỏi</li>
              <li>Dữ liệu ứng viên phân tán, khó quản lý</li>
              <li>Thiếu công cụ đánh giá chính xác năng lực</li>
              <li>Chi phí tuyển dụng cao nhưng hiệu quả thấp</li>
              <li>Quy trình phức tạp, thiếu sự đồng bộ giữa các phòng ban</li>
            </ul>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-6 rounded-2xl border-8 border-white bg-primary-dark px-8 py-10 shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                Tuyển dụng với SmartHire
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-stone-300 md:text-sm">
                Quy trình tự động hóa thông minh giúp tối ưu thời gian, chi phí
                và thu hút nhân tài hiệu quả.
              </p>
            </div>
            <div className="h-px w-full bg-stone-300/40"></div>
          </div>

          <div className="flex flex-1 items-center rounded-2xl bg-white">
            <ul className="flex w-full list-disc flex-col justify-between p-8 text-sm md:p-12 md:text-base">
              <li>Sàng lọc CV tự động bằng AI, tiết kiệm 90% thời gian</li>
              <li>Tương tác & phản hồi ứng viên tức thì, giữ chân nhân tài</li>
              <li>Quản lý dữ liệu ứng viên tập trung trên một nền tảng</li>
              <li>
                Đánh giá năng lực chính xác nhờ bộ công cụ & tiêu chí chuẩn hóa
              </li>
              <li>Tối ưu chi phí tuyển dụng, mang lại hiệu quả vượt trội</li>
              <li>Quy trình chuẩn hóa, kết nối mượt mà giữa các phòng ban</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonial = () => {
  return (
    <div className="flex w-full flex-col gap-10 bg-bg py-10 md:py-20">
      <div className="flex flex-col items-center justify-center gap-4">
        <Button text="Đánh giá" type="secondary" />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="h-fit w-fit bg-primary px-8 py-1 md:px-12 md:py-4">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Được tin tưởng
            </h1>
          </div>
          <p className="text-xl md:text-3xl">bởi các nhà tuyển dụng hàng đầu</p>
        </div>
      </div>

      <ThreeDScrollTriggerContainer className="flex flex-col gap-4">
        <ThreeDScrollTrigger baseVelocity={5} direction={1}>
          {testimonialData.map((item) => (
            <TestimonialCard
              key={`row1-${item.id}`}
              data={item}
              className="mx-4"
            />
          ))}
        </ThreeDScrollTrigger>

        <ThreeDScrollTrigger baseVelocity={8} direction={-1}>
          {testimonialData.map((item) => (
            <TestimonialCard
              key={`row2-${item.id}`}
              data={item}
              className="mx-4"
            />
          ))}
        </ThreeDScrollTrigger>
      </ThreeDScrollTriggerContainer>

      <div className="flex flex-col items-center justify-center gap-4">
        <p className="max-w-100 text-center text-xl font-medium md:max-w-200 md:text-4xl">
          Bạn có muốn biết cách chúng tôi xây dựng lòng tin với khách hàng?
        </p>
        <Button
          text="Tìm hiểu ngay"
          className="text-lg! md:px-8! md:text-2xl!"
        />
      </div>
    </div>
  );
};

const CTA = () => {
  return (
    <section className="relative w-full px-4 pt-20! pb-30! sm:px-6 md:py-24 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
      linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(203, 213, 225, 0.4) 1px, transparent 1px),
      radial-gradient(circle 600px at 20% 100%, rgba(56, 189, 248, 0.25), transparent),
      radial-gradient(circle 600px at 80% 20%, rgba(27, 59, 111, 0.15), transparent)
    `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />
      <div className="relative container mx-auto max-w-6xl">
        <div className="relative flex min-h-95 w-full flex-col items-center justify-between overflow-visible rounded-3xl bg-primary-dark p-8 text-white shadow-2xl sm:p-12 lg:flex-row lg:p-14">
          <div className="pointer-events-none absolute -bottom-4 left-1/2 z-0 h-12 w-[92%] -translate-x-1/2 rounded-b-3xl bg-primary-dark/50" />

          <div className="pointer-events-none absolute -bottom-8 left-1/2 z-0 h-12 w-[84%] -translate-x-1/2 rounded-b-3xl bg-primary-dark/25" />

          <div className="z-10 w-full space-y-6 text-center lg:w-3/5 lg:text-left">
            <h2 className="text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl xl:text-5xl">
              Bạn Là Nhà Tuyển Dụng Đang Tìm Kiếm Nhân Tài?
            </h2>

            <p className="mx-auto max-w-xl text-xs leading-relaxed text-stone-300 sm:text-sm lg:mx-0 lg:text-base">
              Đăng tin tuyển dụng không giới hạn, tiếp cận mạng lưới hơn
              500.000+ ứng viên chất lượng cao và để AI tự động lọc, chấm điểm
              và xếp hạng hồ sơ theo mức độ phù hợp ngay trong ngày.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <Button
                text="Bắt đầu ngay"
                className="border-none! bg-status-active! px-6! py-3! text-sm font-semibold text-primary-dark! transition-all hover:opacity-90 sm:text-base!"
              />
              <Button
                text="Liên hệ"
                type="outline"
                className="border-white/40! px-6! py-3! text-sm text-white! hover:bg-white/10! sm:text-base!"
              />
            </div>
          </div>

          <div className="mt-6 flex w-full justify-center lg:mt-0 lg:w-2/5 lg:justify-end">
            <div className="pointer-events-none relative z-20 flex w-60 items-end sm:w-72 lg:absolute lg:right-6 lg:bottom-0 lg:h-[120%] lg:w-95 xl:w-105">
              <img
                src={OfficeGirl}
                alt="SmartHire Recruitment Advisor"
                className="h-full w-full object-contain object-bottom drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="text-text w-full overflow-hidden border-t border-stone-200/80 bg-white pt-20 pb-6">
      <div className="container mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 pb-16 md:grid-cols-2 lg:grid-cols-5 lg:gap-16">
          <div className="space-y-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src={SmartHire_default}
                alt="SmartHire Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-text-muted md:text-base">
              Nền tảng công nghệ việc làm và tạo CV thế hệ mới, ứng dụng trí tuệ
              nhân tạo giúp gắn kết nhân tài và tổ chức nhanh chóng, hiệu quả và
              tối ưu chi phí.
            </p>
            <div className="space-y-2 pt-2 text-xs text-text-muted sm:text-sm">
              <p>
                <strong className="text-text font-semibold">Hotline:</strong>{" "}
                1900 3268 (8:00 - 18:00 Thứ 2 - Thứ 6)
              </p>
              <p>
                <strong className="text-text font-semibold">Email:</strong>{" "}
                support@smarthire.vn
              </p>
              <p>
                <strong className="text-text font-semibold">Trụ sở:</strong>{" "}
                Tầng 12, Tòa nhà Sheraton, đường 30/4, Ninh Kiều, Cần Thơ
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-text text-xs font-bold tracking-wider uppercase">
              Dành Cho Ứng Viên
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tạo CV AI chuẩn ATS
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tìm việc làm IT & Tech
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tìm việc làm Marketing
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Thư viện mẫu CV đẹp
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Kiểm tra điểm ATS của CV
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-text text-xs font-bold tracking-wider uppercase">
              Nhà Tuyển Dụng
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Đăng tin tuyển dụng
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Tìm hồ sơ nhân tài AI
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Giải pháp ATS Doanh nghiệp
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Báo cáo thị trường lương
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Liên hệ tư vấn HR
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-text text-xs font-bold tracking-wider uppercase">
              Về SmartHire
            </h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Giới thiệu nền tảng
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Blog & Cẩm nang nghề nghiệp
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Chính sách bảo mật dữ liệu
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-primary">
                  Trung tâm trợ giúp (FAQs)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200/70 pt-8 text-xs text-text-muted sm:flex-row sm:text-sm">
          <p>
            © 2026 SmartHire Inc. Nền tảng tuyển dụng thông minh. Mọi quyền được
            bảo lưu.
          </p>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <a href="#" className="transition-colors hover:text-primary">
              Quyền riêng tư
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Điều khoản
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Bảo mật
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Sitemap
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none mt-12 flex w-full justify-center px-4 opacity-95 select-none">
        <img
          src={SmartHire_text_only}
          alt="SmartHire Brand"
          className="h-auto w-full max-w-350 object-contain"
        />
      </div>
    </footer>
  );
};
function LandingPage() {
  return (
    <div className="w-full bg-bg">
      <HeroSection />
      <NumberProof />
      <Features />
      <CVTemplate />
      <HitDifferent />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  );
}

export default LandingPage;
