import { useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import { Office } from "@/assets/images/decoration";
import { SmartHire_default } from "@/assets/images/logo";
import Button from "@/components/common/Button";
import { AlertCircle, Lock, UserRound } from "lucide-react";
import { Eye, EyeOff } from "lucide";
import { useLogin, useGoogleLogin } from "@/hooks/queries/useAccount";
import { MorphIcon } from "morphicons/react";
import { toast } from "@/components/ui/toast";
import { getApiErrorCode, getApiErrorMessage } from "@/api/errorHandler";
import { PATHS } from "@/constants/paths";
import {
  getFirebaseAuthErrorMessage,
  isFirebasePopupCancelled,
  signInWithGooglePopup,
} from "@/lib/firebase";
import type { GoogleAuthRole } from "@/types/auth";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import GoogleRoleSelectModal from "@/components/auth/GoogleRoleSelectModal";

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: login, isPending: isLoading } = useLogin();
  const { mutateAsync: googleLogin, isPending: isGoogleMutationPending } =
    useGoogleLogin();
  const from =
    (location.state as { from?: Location | string } | null)?.from || PATHS.HOME;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPopupPending, setIsPopupPending] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(
    null,
  );
  const [roleModalError, setRoleModalError] = useState<string | null>(null);

  const isGoogleLoading = isPopupPending || isGoogleMutationPending;
  const isBusy = isLoading || isGoogleLoading;

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

    try {
      await login({
        email: trimmedEmail,
        password,
      });

      toast.add({ type: "success", description: "Đăng nhập thành công" });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        ),
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsPopupPending(true);

    let idToken: string;
    try {
      idToken = await signInWithGooglePopup();
    } catch (err: unknown) {
      if (!isFirebasePopupCancelled(err)) {
        setErrorMessage(
          getFirebaseAuthErrorMessage(err) ??
            "Không thể xác thực tài khoản Google. Vui lòng thử lại.",
        );
      }
      return;
    } finally {
      setIsPopupPending(false);
    }

    try {
      await googleLogin({ idToken });
      toast.add({ type: "success", description: "Đăng nhập thành công" });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (getApiErrorCode(err) === "AUTH_GOOGLE_ROLE_REQUIRED") {
        setRoleModalError(null);
        setPendingGoogleToken(idToken);
        return;
      }
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Đăng nhập bằng Google thất bại. Vui lòng thử lại.",
        ),
      );
    }
  };

  const handleConfirmGoogleRole = async (selectedRole: GoogleAuthRole) => {
    if (!pendingGoogleToken) return;
    setErrorMessage(null);
    setRoleModalError(null);

    try {
      await googleLogin({ idToken: pendingGoogleToken, role: selectedRole });
      setPendingGoogleToken(null);
      setRoleModalError(null);
      toast.add({ type: "success", description: "Đăng nhập thành công" });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const message = getApiErrorMessage(
        err,
        "Đăng ký tài khoản Google thất bại. Vui lòng thử lại.",
      );
      const nonRetryable =
        code === "AUTH_INVALID_GOOGLE_TOKEN" ||
        code === "AUTH_GOOGLE_EMAIL_NOT_VERIFIED" ||
        code === "AUTH_GOOGLE_ROLE_MISMATCH" ||
        code === "AUTH_EMAIL_ALREADY_EXISTS" ||
        code === "AUTH_ACCOUNT_NOTALLOWED";

      if (nonRetryable) {
        setPendingGoogleToken(null);
        setRoleModalError(null);
        setErrorMessage(message);
      } else {
        setRoleModalError(message);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-screen flex-col gap-4 bg-surface p-3 font-sans sm:p-4 md:max-w-[92%] xl:flex-row xl:gap-5 xl:py-4 3xl:max-w-[88%] 3xl:gap-6 3xl:p-6">
      <div className="flex w-full flex-col gap-4 xl:w-1/2 3xl:gap-6">
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/40 bg-linear-to-br from-white via-secondary/40 to-secondary-dark/80 p-5 shadow-sm sm:p-8 xl:rounded-[2rem] xl:px-12 xl:py-6 2xl:px-16 3xl:rounded-[2.5rem] 3xl:px-24 3xl:py-12">
          <div className="mb-4 flex items-center gap-2 sm:mb-5 3xl:mb-10">
            <Link to={PATHS.HOME}>
              <img
                src={SmartHire_default}
                alt="SmartHire Logo"
                loading="lazy"
                className="h-8 w-auto sm:h-9 3xl:h-11"
              />
            </Link>
          </div>

          <h1 className="text-text mb-2 text-center text-2xl font-bold sm:text-3xl 3xl:mb-4 3xl:text-4xl">
            Say hello to SmartHire!
          </h1>
          <p className="mb-5 max-w-sm text-center text-xs leading-relaxed text-text-muted sm:text-sm 3xl:mb-8 3xl:max-w-md 3xl:text-base">
            Chào mừng bạn đến với hệ sinh thái tuyển dụng tất cả trong một, tạm
            biệt cách làm truyền thống phức tạp
          </p>

          <form
            className="flex w-full max-w-md flex-col gap-3.5 xl:gap-4 3xl:max-w-lg 3xl:gap-5"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <div className="relative flex items-center">
              <span className="absolute left-4 text-text-muted 3xl:left-5">
                <UserRound size={18} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                disabled={isBusy}
                required
                className="text-text w-full rounded-full border-none bg-white py-3 pr-5 pl-12 text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100 3xl:py-4 3xl:pr-6 3xl:pl-14 3xl:text-base"
              />
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-4 text-text-muted 3xl:left-5">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isBusy}
                required
                className="text-text w-full rounded-full border-none bg-white py-3 pr-12 pl-12 text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-gray-100 3xl:py-4 3xl:pl-14 3xl:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="hover:text-text absolute right-4 cursor-pointer text-text-muted transition-colors 3xl:right-5"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <MorphIcon icon={showPassword ? EyeOff : Eye} />
              </button>
            </div>

            {/* Thông báo lỗi không background, không border, giữ min-height chống giật layout */}
            <div className="-mt-1.5 flex min-h-5 items-center px-3">
              {errorMessage ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-status-error animate-in fade-in duration-150">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}
            </div>

            <div className="-mt-2.5 flex justify-end">
              <a
                href="#"
                className="text-text text-xs font-semibold transition-colors hover:text-primary sm:text-sm"
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isBusy}
              className="py-3! text-sm! font-medium! 3xl:py-4! 3xl:text-base!"
            >
              Đăng nhập
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/80" />
              <span className="text-xs font-medium text-text-muted">Hoặc</span>
              <div className="h-px flex-1 bg-border/80" />
            </div>

            <GoogleAuthButton
              label="Đăng nhập Google"
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              disabled={isBusy}
              className="py-3! text-sm! 3xl:py-4! 3xl:text-base!"
            />
          </form>

          <div className="mt-5 text-xs text-text-muted sm:text-sm 3xl:mt-8">
            Bạn là người mới?{" "}
            <Link
              to={PATHS.SIGN_UP}
              className="text-text font-bold transition-colors hover:text-primary"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-border/30 bg-bg-white-blue p-4 px-5 shadow-sm md:gap-5 md:rounded-full xl:px-6 xl:py-3.5 3xl:p-6 3xl:px-8">
          <div className="flex shrink-0 -space-x-3">
            {[1, 2, 3].map((item) => (
              <img
                key={item}
                className="h-9 w-9 rounded-full border-2 border-white object-cover md:h-10 md:w-10 3xl:h-12 3xl:w-12"
                loading="lazy"
                src={`https://i.pravatar.cc/100?img=${item + 39}`}
                alt="Avatar"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-text text-xs font-bold sm:text-sm 3xl:text-base">
              Hơn 10.000+ nhân tài đã tham gia
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted sm:text-xs 3xl:mt-1">
              Gia nhập cộng đồng SmartHire để nắm bắt những cơ hội nghề nghiệp
              tốt nhất!
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden rounded-[2rem] shadow-lg xl:block 3xl:rounded-[2.5rem]">
        <img
          src={Office}
          alt="SmartHire Office"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute right-5 bottom-5 left-5 flex flex-col justify-end rounded-3xl border border-white/20 bg-black/10 p-6 text-white shadow-2xl backdrop-blur-md 3xl:right-6 3xl:bottom-6 3xl:left-6 3xl:rounded-4xl 3xl:p-8">
          <div className="mb-4 flex gap-3 3xl:mb-6 3xl:gap-4">
            <button className="cursor-pointer rounded-full border border-white/50 px-5 py-2 text-xs font-medium backdrop-blur-sm transition-all hover:bg-white/20 3xl:px-6 3xl:py-2.5 3xl:text-sm">
              Xem thông báo mới
            </button>
            <button className="cursor-pointer rounded-full border border-white/50 px-5 py-2 text-xs font-medium backdrop-blur-sm transition-all hover:bg-white/20 3xl:px-6 3xl:py-2.5 3xl:text-sm">
              Đối tác
            </button>
          </div>

          <h3 className="text-base font-light opacity-90 3xl:text-lg">
            Cam kết mang lại giải pháp tối ưu!
          </h3>
        </div>
      </div>

      <GoogleRoleSelectModal
        open={Boolean(pendingGoogleToken)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingGoogleToken(null);
            setRoleModalError(null);
          }
        }}
        onConfirm={handleConfirmGoogleRole}
        isLoading={isGoogleMutationPending}
        errorMessage={roleModalError}
      />
    </div>
  );
}

export default SignIn;
