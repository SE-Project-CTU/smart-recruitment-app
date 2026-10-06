import HumanImage from "@/assets/images/decoration/Human 3x4.png";
import Elipse from "@/assets/images/decoration/Ellipse 1.svg";
import Rectangle_1 from "@/assets/images/decoration/Rectangle 1.svg";
import Rectangle_2 from "@/assets/images/decoration/Rectangle 2.svg";
import Rectangle_3 from "@/assets/images/decoration/Rectangle 3.svg";
import Button from "@/components/Button";
import TextType from "@/components/external/TextType";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-bg-bg pt-28 pb-16 lg:pt-32">
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

function LandingPage() {
  return (
    <div className="w-full bg-bg">
      <HeroSection />
    </div>
  );
}

export default LandingPage;
