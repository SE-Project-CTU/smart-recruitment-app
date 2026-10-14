import Button from "@/components/Button";
import { HightlightSideBackground } from "@/components/CustomBackground";
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
    <div className="relative flex h-screen flex-col items-center justify-center text-text-main">
      <HightlightSideBackground />
      <Header />
      <div className="relative">
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
        <div className="absolute top-3/4 left-1/2 flex w-full -translate-x-1/2 flex-col items-center justify-center gap-5">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-8xl">
            Page Not Found
          </h1>
          <p className="text-center text-sm text-text-muted md:text-lg">
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
