import Button from "@/components/Button";
import Header from "@/components/Header";
import { TextParticleAnimation } from "@/components/lightswind/text-particle-animation";
import { MoveLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: Location | string } | null)?.from || "/";
  return (
    <div className="flex flex-col items-center justify-center font-sans text-text-main">
      <Header />

      <div className="relative pt-40">
        <div className="opacity-70">
          <TextParticleAnimation
            text="404"
            fontSize={600}
            fontFamily="sans-serif"
            fontWeight={300}
            resolution={10}
            pixelSize={2}
            hoverRadius={80}
            repelForce={15}
            clickRadius={100}
            clickForce={20}
            springForce={0.08}
            friction={0.85}
            theme="light"
            padding={30}
          />
        </div>
        <div className="absolute top-3/4 left-1/2 flex w-full -translate-x-1/2 flex-col items-center justify-center gap-5">
          <h1 className="text-8xl font-semibold tracking-tighter">
            Page Not Found
          </h1>
          <p className="text-lg text-text-muted">
            Rất tiếc nội dung bạn đang truy cập không tồn tại!
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              text="Trở lại"
              icon={MoveLeft}
              type="secondary"
              onClick={() => navigate(from, { replace: true })}
            />
            <Button text="Trang chủ" onClick={() => navigate("/")} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
