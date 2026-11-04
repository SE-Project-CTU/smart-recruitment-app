import {
  Button,
  Header,
  HightlightSideBackground,
} from "@/components/common";
import { TextParticleAnimation } from "@/components/lightswind/text-particle-animation";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import { useAuthStore } from "@/stores/authStore";
import { getDashboardPathByRole } from "@/utils/helper";

interface BadRequestPageProps {
  description?: string;
  title?: string;
  httpCode?: string;
}

function BadRequestPage({
  title = "Page not found",
  httpCode = "404",
  description = "Rất tiếc nội dung bạn đang truy cập không tồn tại!",
}: BadRequestPageProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // const location = useLocation();
  // const previousPath = (location.state as { from?: string | Location })?.from;

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      const userRole = user?.roles?.[0];
      const safeDashboard = getDashboardPathByRole(userRole);
      navigate(safeDashboard, { replace: true });
    }
  };

  const handleGoHome = () => {
    const userRole = user?.roles?.[0];
    if (userRole) {
      navigate(getDashboardPathByRole(userRole), { replace: true });
    } else {
      navigate(PATHS.HOME, { replace: true });
    }
  };
  return (
    <div className="relative flex h-screen flex-col items-center justify-center text-text-main">
      <HightlightSideBackground />
      <Header />
      <div className="relative">
        <TextParticleAnimation
          text={httpCode}
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
            {title}
          </h1>
          <p className="text-center text-sm text-text-muted md:text-lg">
            {description}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button icon={MoveLeft} variant="secondary" onClick={handleGoBack}>
              Trở lại
            </Button>
            <Button onClick={handleGoHome}>Trang chủ</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BadRequestPage;
