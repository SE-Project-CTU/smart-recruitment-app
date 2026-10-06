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
import { logoItems } from "@/constants/logoItems";
import {
  BuildingComplexIcon,
  ChartBarStackedIcon,
  FileTextIcon,
  LightbulbIcon,
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center bg-bg-white-blue justify-center overflow-bg-bg pt-28 pb-16 lg:pt-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-60">
          <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-8 z-10 text-center lg:text-left">
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
              <span>Make the impossible</span>
              <span className="block mt-2">
                to the{" "}
                <TextType
                  text={["possible"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor
                  cursorCharacter="_"
                  deletingSpeed={50}
                  className="text-secondary-dark inline-block"
                  variableSpeed={undefined}
                  onSentenceComplete={undefined}
                />
              </span>
            </h1>

            <div className="w-full max-w-2xl mx-auto lg:mx-0 space-y-4 text-text">
              <p className="font-medium text-xl lg:text-2xl tracking-tighter">
                Nâng tầm sự nghiệp và kết nối nhân tài trong kỷ nguyên AI.
              </p>
              <p className="text-text-muted text-sm lg:text-base">
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

          <div className="relative flex justify-center mt-10 lg:mt-0 z-10">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
              <img
                src={HumanImage}
                alt="SmartHire Team"
                className="relative z-10 md:max-w-70 xl:max-w-90 h-auto rounded-3xl shadow-lg object-cover"
              />

              <img
                src={Elipse}
                alt=""
                className="md:block absolute -top-12 -right-12 lg:-top-20 lg:-right-20 z-0 pointer-events-none w-32 lg:w-48 xl:w-64"
              />
              <img
                src={Rectangle_3}
                alt=""
                className="md:block absolute -top-8 -left-8 lg:-top-12 lg:-left-14 z-20 pointer-events-none w-24 lg:w-40"
              />
              <img
                src={Rectangle_1}
                alt=""
                className="md:block absolute -bottom-10 -left-12 lg:-bottom-14 lg:-left-30 z-0 pointer-events-none w-48 lg:w-72 xl:w-92"
              />
              <img
                src={Rectangle_2}
                alt=""
                className="md:block absolute bottom-12 -right-16 lg:bottom-24 lg:-right-32 z-20 pointer-events-none w-32 lg:w-50 opacity-90"
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
    <section className="flex items-center justify-center flex-col bg-primary-dark w-full h-fit py-20  px-5 md:px-40">
      <div className="flex items-center justify-between w-full mb-12">
        <p className="text-white font-semibold">SmartHire By The Numbers</p>
        <Button text="Tìm hiểu thêm" type="outline" />
      </div>
      <div className="grid grid-cols-2 grid-rows-2 md:grid-rows-1 md:grid-cols-4 gap-10 text-white w-full">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-4xl md:text-5xl lg:text-6xl">
            <CountUp from={0} to={500} onStart={undefined} onEnd={undefined} />
            K+
          </span>
          <span className="text-stone-300 text-xs md:text-sm lg:text-lg">
            Ứng viên tin dùng & tạo CV chuẩn ATS mỗi tháng{" "}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-4xl md:text-5xl lg:text-6xl ">
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
          <span className="text-stone-300 text-xs md:text-sm lg:text-lg">
            Doanh nghiệp hàng đầu đăng tin tuyển dụng
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-4xl md:text-5xl lg:text-6xl">
            <CountUp from={0} to={94} onStart={undefined} onEnd={undefined} />%
          </span>
          <span className="text-stone-300 text-xs md:text-sm lg:text-lg">
            Tỷ lệ hồ sơ vượt qua hệ thống quét lọc ATS tự động
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-4xl md:text-5xl lg:text-6xl">
            <CountUp
              from={0}
              to={200}
              onStart={undefined}
              onEnd={undefined}
              className="text-secondary"
            />
            <span className="text-secondary">M</span>+
          </span>
          <span className="text-stone-300 text-xs md:text-sm lg:text-lg">
            Lượt tương tác và kết nối hồ sơ nghề nghiệp thành công
          </span>
        </div>
      </div>
      <div className="h-px w-full bg-border/70 my-10"></div>
      <span className="text-center font-semibold text-stone-300 mb-6 uppercase text-sm">
        Được tin dùng bởi các tập đoàn và doanh nghiệp hàng đầu
      </span>
      <SlidingLogoMarquee items={logoItems} speed={5} />
    </section>
  );
};

const Features = () => {
  return (
    <div className="bg-bg py-16 md:py-30 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="space-y-4 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-main">
          Quy Trình & Tính Năng Vượt Trội
        </h1>
        <p className="text-text-muted text-sm sm:text-base leading-relaxed text-center">
          Hệ sinh thái thông minh giúp sàng lọc ứng viên chính xác, tối ưu CV
          vượt chuẩn ATS và rút ngắn 70% thời gian tuyển dụng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center justify-items-center">
        <div className="w-full space-y-12 order-1 lg:order-1 flex flex-col items-center lg:items-end">
          <div className="bg-primary rounded-2xl flex p-6 gap-4 w-full max-w-md shadow-md">
            <div className="p-4 rounded-xl bg-secondary/20 shrink-0 w-fit h-fit">
              <FileTextIcon className="text-secondary w-6 h-6" />
            </div>
            <div className="text-white">
              <h2 className="font-semibold text-lg mb-1">Tối Ưu CV Bằng AI</h2>
              <p className="text-stone-200 text-sm leading-relaxed">
                Tự động chuẩn hóa cấu trúc ATS, tối ưu từ khóa và chấm điểm hồ
                sơ theo thời gian thực.
              </p>
            </div>
          </div>

          <div className="bg-status-active rounded-2xl flex p-6 gap-4 w-full max-w-md shadow-md">
            <div className="p-4 rounded-xl bg-[#88d7fb] shrink-0 w-fit h-fit">
              <BuildingComplexIcon className="text-primary w-6 h-6" />
            </div>
            <div className="text-primary">
              <h2 className="font-semibold text-lg mb-1">
                Đăng Tuyển Không Giới Hạn
              </h2>
              <p className="text-primary/90 text-sm leading-relaxed">
                Mô hình mở không giới hạn chỉ tiêu tin tuyển dụng, giúp doanh
                nghiệp tiết kiệm đến 70% ngân sách nhân sự.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full order-3 lg:order-2 flex justify-center py-4 lg:py-0">
          <img
            src={CandidateMatching}
            alt="Candidate Matching"
            className="w-full max-w-xs sm:max-w-sm lg:max-w-md h-auto object-contain drop-shadow-xl"
          />
        </div>

        <div className="w-full space-y-12 order-4 lg:order-3 flex flex-col items-center lg:items-start">
          <div className="bg-[#fbbf24] rounded-2xl flex p-6 gap-4 w-full max-w-md shadow-md">
            <div className="p-4 rounded-xl bg-[#fdd97c] shrink-0 w-fit h-fit">
              <LightbulbIcon className="text-[#78350f] w-6 h-6" />
            </div>
            <div className="text-[#78350f]">
              <h2 className="font-semibold text-lg mb-1">
                Ghép Đôi Thông Minh
              </h2>
              <p className="text-[#78350f]/90 text-sm leading-relaxed">
                Thuật toán AI độc quyền khớp đúng kỹ năng, mức lương kỳ vọng và
                môi trường văn hóa doanh nghiệp.
              </p>
            </div>
          </div>

          <div className="bg-[#0284c7] rounded-2xl flex p-6 gap-4 w-full max-w-md shadow-md">
            <div className="p-4 rounded-xl bg-[#359dd2] shrink-0 w-fit h-fit">
              <ChartBarStackedIcon className="text-white w-6 h-6" />
            </div>
            <div className="text-white">
              <h2 className="font-semibold text-lg mb-1">
                Phân Tích Dữ Liệu Thời Gian Thực
              </h2>
              <p className="text-stone-200 text-sm leading-relaxed">
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
  return <div>CVtemplateee</div>;
};

const HitDifferent = () => {
  return <div>HitDiffecternt</div>;
};

const Testimonial = () => {
  return <div>Testimonial</div>;
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
