import HumanImage from "@/assets/images/decoration/Human 3x4.png";
import Elipse from "@/assets/images/decoration/Ellipse 1.svg";
import Rectangle_1 from "@/assets/images/decoration/Rectangle 1.svg";
import Rectangle_2 from "@/assets/images/decoration/Rectangle 2.svg";
import Rectangle_3 from "@/assets/images/decoration/Rectangle 3.svg";
import CandidateMatching from "@/assets/images/decoration/Candidate matching panel.svg";
import Button from "@/components/Button";
import TextType from "@/components/external/TextType";
import CountUp from "@/components/external/CountUp";
import SlidingLogoMarquee from "@/components/lightswind/sliding-logo-marquee";
import { imageSlide, logoItems } from "@/constants/LandingpageConsts";
import {
  BuildingComplexIcon,
  ChartBarStackedIcon,
  FileTextIcon,
  LightbulbIcon,
} from "lucide-react";
import CoolSlideGallery from "@/components/lightswind/cool-slide-gallery";
import { useEffect, useState } from "react";

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
                className="w-fit! px-8! py-4! text-base!"
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
  return <div></div>;
};

const CTA = () => {
  return <div>Testimonial</div>;
};

const Footer = () => {
  return <div>footer</div>;
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
