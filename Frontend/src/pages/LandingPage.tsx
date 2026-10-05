import HumanImage from "@/assets/images/decoration/Human 3x4.png";
import Button from "@/components/Button";

const HeroSection = () => {
  return (
    <div className="pt-50 px-52 flex  flex-col md:flex-row items-center justify-between">
      <div className="flex flex-col gap-8">
        <h1 className="font-bold text-7xl">
          <span>Make the impossible</span>
          <span className="block">to the possible</span>
        </h1>
        <div className="max-w-180 space-y-4">
          <p className="font-medium text-2xl tracking-tighter">
            Nâng tầm sự nghiệp và kết nối nhân tài trong kỷ nguyên AI.
          </p>
          <p>
            SmartHire ứng dụng trí tuệ nhân tạo thế hệ mới giúp tối ưu hóa quy
            trình tuyển dụng, kết nối ứng viên tiềm năng với doanh nghiệp hàng
            đầu một cách nhanh chóng, chính xác và hiệu quả vượt trội.
          </p>
        </div>
        <Button text="Bắt đầu ngay" className="w-fit! px-6! py-4! text-base!" />
      </div>
      <div>
        <img src={HumanImage} alt="" className="max-w-80 rounded-3xl" />
      </div>
    </div>
  );
};

function LandingPage() {
  return (
    <div>
      <HeroSection />
    </div>
  );
}

export default LandingPage;
