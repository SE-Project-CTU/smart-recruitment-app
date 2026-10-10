import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Office } from "@/assets/images/decoration";
import { SmartHire_default } from "@/assets/images/logo";
import Button from "@/components/Button";
import { AlertCircle, Lock, UserRound } from "lucide-react";
import { Eye, EyeOff } from "lucide";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { MorphIcon } from "morphicons/react";
import { toast } from "@/components/ui/toast";

function SignIn() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: trimmedEmail,
        password,
      });

      // đăng nhập thành công nè
      if (response && response.data) {
        setAuth(response.data);
        navigate("/", { replace: true });
        toast.add({ type: "success", description: "Đăng nhập thành công" });
      } else {
        setErrorMessage("Không nhận được dữ liệu xác thực từ hệ thống.");
      }
    } catch (err: unknown) {
      console.error("SignIn error:", err);

      let message = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      if (typeof err === "object" && err !== null) {
        const errorObj = err as Record<string, unknown>;
        if (typeof errorObj.message === "string") {
          message = errorObj.message;
        } else if (typeof errorObj.detail === "string") {
          message = errorObj.detail;
        } else if (typeof errorObj.title === "string") {
          message = errorObj.title;
        }
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen flex-col gap-6 bg-surface p-4 font-sans md:max-w-[90%] md:p-6 xl:flex-row">
      <div className="flex w-full flex-col gap-6 xl:w-1/2">
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-border/40 bg-linear-to-br from-white via-secondary/40 to-secondary-dark/80 p-8 shadow-sm md:p-12 lg:px-24">
          <div className="mb-10 flex items-center gap-2">
            <Link to="/">
              <img src={SmartHire_default} alt="SmartHire Logo" />
            </Link>
          </div>

          <h1 className="text-text mb-4 text-center text-3xl font-bold md:text-4xl">
            Say hello to SmartHire!
          </h1>
          <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-text-muted md:text-base">
            Chào mừng bạn đến với hệ sinh thái tuyển dụng tất cả trong một, tạm
            biệt cách làm truyền thống phức tạp
          </p>

          {/* Alert error message if any */}
          {errorMessage && (
            <div className="mb-6 flex w-full max-w-md items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 transition-all">
              <AlertCircle size={18} className="shrink-0" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          <form
            className="flex w-full max-w-md flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <div className="relative flex items-center">
              <span className="absolute left-5 text-text-muted">
                <UserRound size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={isLoading}
                required
                className="text-text w-full rounded-full border-none bg-white py-4 pr-6 pl-14 text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100"
              />
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-5 text-text-muted">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                className="text-text w-full rounded-full border-none bg-white py-4 pr-12 pl-14 text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="hover:text-text absolute right-5 cursor-pointer text-text-muted transition-colors"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <MorphIcon icon={showPassword ? EyeOff : Eye} />
              </button>
            </div>

            <div className="-mt-2 flex justify-end">
              <a
                href="#"
                className="text-text text-sm font-semibold transition-colors hover:text-primary"
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button
              htmlType="submit"
              text="Đăng nhập"
              isLoading={isLoading}
              className="py-4! text-base! font-medium!"
            />

            <button
              type="button"
              disabled={isLoading}
              className="text-text flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-white py-4 font-medium shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              Đăng nhập Google
            </button>
          </form>

          <div className="mt-8 text-xs text-text-muted md:text-sm">
            Bạn là người mới?{" "}
            <Link
              to="/sign-up"
              className="text-text font-bold transition-colors hover:text-primary"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-10 rounded-full border border-border/30 bg-bg-white-blue p-6 px-8 shadow-sm md:gap-5">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((item) => (
              <img
                key={item}
                className="h-8 w-8 rounded-full border-2 border-white object-cover md:h-12 md:w-12"
                src={`https://i.pravatar.cc/100?img=${item + 10}`}
                alt="Avatar"
              />
            ))}
          </div>
          <div>
            <p className="text-text text-sm font-bold">
              Hơn 10.000+ nhân tài đã tham gia
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Gia nhập cộng đồng SmartHire để nắm bắt những cơ hội nghề nghiệp
              tốt nhất!
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden rounded-[2.5rem] shadow-lg xl:block">
        <img
          src={Office}
          alt="SmartHire Office"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute right-6 bottom-6 left-6 flex flex-col justify-end rounded-4xl border border-white/20 bg-black/10 p-8 text-white shadow-2xl backdrop-blur-md">
          <div className="mb-6 flex gap-4">
            <button className="cursor-pointer rounded-full border border-white/50 px-6 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/20">
              Xem thông báo mới
            </button>
            <button className="cursor-pointer rounded-full border border-white/50 px-6 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/20">
              Đối tác
            </button>
          </div>

          <h3 className="text-lg font-light opacity-90">
            Cam kết mang lại giải pháp tối ưu!
          </h3>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
