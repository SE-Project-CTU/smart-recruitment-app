import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Office, OfficeGirl } from "@/assets/images/decoration";
import { SmartHire_default } from "@/assets/images/logo";
import Button from "@/components/common/Button";
import { AlertCircle, Lock, Mail, Phone, User, Building2 } from "lucide-react";
import { Eye, EyeOff } from "lucide";
import { MorphIcon } from "morphicons/react";
import { toast } from "@/components/ui/toast";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
} from "@/components/animate-ui/components/base/tabs";
import { Blur } from "@/components/animate-ui/primitives/effects/blur";
import {
  useGoogleLogin,
  useRegisterCandidate,
  useRegisterRecruiter,
} from "@/hooks/queries/useAccount";
import { getApiErrorMessage } from "@/api/errorHandler";
import { PATHS } from "@/constants/paths";
import {
  getFirebaseAuthErrorMessage,
  isFirebasePopupCancelled,
  signInWithGooglePopup,
} from "@/lib/firebase";
import type { GoogleAuthRole } from "@/types/auth";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

function SignUp() {
  const navigate = useNavigate();

  const { mutateAsync: registerCandidate, isPending: isCandidatePending } =
    useRegisterCandidate();
  const { mutateAsync: registerRecruiter, isPending: isRecruiterPending } =
    useRegisterRecruiter();
  const { mutateAsync: googleLogin, isPending: isGoogleMutationPending } =
    useGoogleLogin();

  const [isPopupPending, setIsPopupPending] = useState(false);

  const isLoading = isCandidatePending || isRecruiterPending;
  const isGoogleLoading = isPopupPending || isGoogleMutationPending;
  const isBusy = isLoading || isGoogleLoading;

  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreeTerms) {
      setErrorMessage("Vui lòng đồng ý với Điều khoản & Chính sách.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên.");
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phoneNumber.trim(),
        password,
      };

      if (role === "candidate") {
        await registerCandidate(payload);
      } else {
        await registerRecruiter(payload);
      }

      toast.add({
        type: "success",
        description: "Đăng ký tài khoản thành công!",
      });

      navigate(PATHS.SIGN_IN);
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
        ),
      );
    }
  };

  const handleGoogleSignUp = async () => {
    const targetRole: GoogleAuthRole =
      role === "recruiter" ? "Recruiter" : "Candidate";

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
      await googleLogin({ idToken, role: targetRole });
      toast.add({
        type: "success",
        description: "Đăng ký và đăng nhập thành công!",
      });
      navigate(PATHS.HOME, { replace: true });
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Đăng ký bằng Google thất bại. Vui lòng thử lại.",
        ),
      );
    }
  };

  const renderFormFields = () => (
    <form
      className="flex w-full flex-col gap-2.5 3xl:gap-3.5"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 3xl:gap-3.5">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-semibold text-text-main">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-text-muted 3xl:left-4">
              <User size={16} />
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên"
              disabled={isBusy}
              required
              className="input-primary py-2.5! pr-3! pl-10! text-xs! sm:text-sm! 3xl:py-3! 3xl:pr-4! 3xl:pl-11!"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-semibold text-text-main">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1.5">
            <span className="flex shrink-0 items-center justify-center rounded-full bg-white px-2.5 text-xs font-bold text-text-muted shadow-sm 3xl:px-3.5">
              +84
            </span>
            <div className="relative flex min-w-0 flex-1 items-center">
              <span className="absolute left-3.5 text-text-muted">
                <Phone size={15} />
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="03268xxxxx"
                disabled={isBusy}
                required
                className="input-primary py-2.5! pr-3! pl-9! text-xs! sm:text-sm! 3xl:py-3! 3xl:pr-4! 3xl:pl-10!"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold text-text-main">
          Địa chỉ Email <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-text-muted 3xl:left-5">
            <Mail size={17} />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email liên hệ"
            disabled={isBusy}
            required
            className="input-primary py-2.5! pr-4! pl-11! 3xl:py-3! 3xl:pr-6! 3xl:pl-14!"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold text-text-main">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-text-muted 3xl:left-5">
            <Lock size={17} />
          </span>
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isBusy}
            required
            className="input-primary py-2.5! pr-11! pl-11! 3xl:py-3! 3xl:pr-12! 3xl:pl-14!"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-4 cursor-pointer text-text-muted transition-colors hover:text-text-main 3xl:right-5"
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <MorphIcon icon={showPassword ? EyeOff : Eye} />
          </button>
        </div>
      </div>

      <div className="mt-0.5 flex items-start gap-2 text-left">
        <input
          type="checkbox"
          id="agreeTerms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          disabled={isBusy}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-primary"
        />
        <label
          htmlFor="agreeTerms"
          className="cursor-pointer text-[11px] leading-snug text-text-muted sm:text-xs"
        >
          Tôi đã đọc và đồng ý với các{" "}
          <a
            href="#"
            className="font-bold text-text-main underline hover:text-primary"
          >
            Điều khoản sử dụng
          </a>{" "}
          và Chính sách bảo mật của SmartHire.
        </label>
      </div>

      {errorMessage && (
        <div className="flex w-full items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 transition-all sm:text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isBusy}
        className="mt-0.5 py-2.5! text-sm! font-medium! 3xl:mt-1.5 3xl:py-3.5! 3xl:text-base!"
      >
        {role === "recruiter"
          ? "Tạo tài khoản Nhà tuyển dụng"
          : "Tạo tài khoản Ứng viên"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/80" />
        <span className="text-xs font-medium text-text-muted">Hoặc</span>
        <div className="h-px flex-1 bg-border/80" />
      </div>

      <GoogleAuthButton
        label="Tiếp tục với Google"
        onClick={handleGoogleSignUp}
        isLoading={isGoogleLoading}
        disabled={isBusy}
      />

      <p className="text-center text-[11px] leading-snug text-text-muted">
        Bằng việc tiếp tục với Google, bạn đồng ý với Điều khoản sử dụng và
        Chính sách bảo mật của SmartHire.
      </p>
    </form>
  );

  return (
    <div className="mx-auto flex min-h-screen flex-col gap-4 bg-surface p-3 font-sans sm:p-4 md:max-w-[92%] xl:flex-row xl:gap-5 xl:py-4 3xl:max-w-[88%] 3xl:gap-6 3xl:p-6">
      {/* Left */}
      <div className="flex w-full flex-col gap-4 xl:w-1/2 3xl:gap-6">
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/40 bg-linear-to-br from-white via-secondary/40 to-secondary-dark/80 p-5 shadow-sm sm:p-7 xl:px-10 xl:py-5 2xl:px-14 3xl:px-20 3xl:py-10">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 3xl:mb-6">
            <Link to={PATHS.HOME}>
              <img
                src={SmartHire_default}
                loading="lazy"
                alt="SmartHire Logo"
                className="h-8 w-auto sm:h-9 3xl:h-11"
              />
            </Link>
          </div>

          <h1 className="mb-1 text-center text-2xl font-bold text-text-main sm:text-3xl 3xl:mb-2 3xl:text-4xl">
            Tạo tài khoản
          </h1>
          <p className="mb-4 max-w-sm text-center text-xs leading-relaxed text-text-muted sm:text-sm 3xl:mb-6 3xl:max-w-md 3xl:text-base">
            Gia nhập nền tảng tuyển dụng thông minh hàng đầu
          </p>

          <Tabs
            defaultValue="candidate"
            onValueChange={(val) => {
              setRole(val as "candidate" | "recruiter");
              setErrorMessage(null);
            }}
            className="w-full max-w-lg 3xl:max-w-xl"
          >
            <TabsList className="grid h-fit! w-full grid-cols-2 border border-border/20 bg-white/80 p-1 shadow-xs">
              <TabsTab
                value="candidate"
                className="flex cursor-pointer items-center justify-center gap-2 py-2 text-xs font-semibold text-text-muted transition-all data-[selected]:bg-primary-dark data-[selected]:text-white data-[selected]:shadow-md sm:text-sm 3xl:py-2.5"
              >
                <User size={16} />
                Ứng viên
              </TabsTab>
              <TabsTab
                value="recruiter"
                className="flex cursor-pointer items-center justify-center gap-2 py-2 text-xs font-semibold text-text-muted transition-all data-[selected]:bg-primary-dark data-[selected]:text-white data-[selected]:shadow-md sm:text-sm 3xl:py-2.5"
              >
                <Building2 size={16} />
                Nhà tuyển dụng
              </TabsTab>
            </TabsList>

            <TabsPanels className="mt-3 w-full 3xl:mt-4">
              <TabsPanel value="candidate" className="w-full">
                {renderFormFields()}
              </TabsPanel>

              <TabsPanel value="recruiter" className="w-full">
                {renderFormFields()}
              </TabsPanel>
            </TabsPanels>
          </Tabs>

          <div className="mt-3.5 text-xs text-text-muted sm:text-sm 3xl:mt-6">
            Đã có tài khoản?{" "}
            <Link
              to={PATHS.SIGN_IN}
              className="font-bold text-text-main transition-colors hover:text-primary"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="relative hidden w-1/2 overflow-hidden rounded-3xl p-8 text-white shadow-lg xl:flex xl:flex-col xl:justify-between 3xl:p-12">
        {role === "candidate" && (
          <Blur key="candidate-img" asChild initialBlur={10} blur={0}>
            <img
              src={Office}
              alt="SmartHire Office Candidate"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </Blur>
        )}

        {role === "recruiter" && (
          <Blur key="recruiter-img" asChild initialBlur={10} blur={0}>
            <img
              src={OfficeGirl}
              loading="lazy"
              alt="SmartHire Office Recruiter"
              className="bg-grid-cus absolute inset-0 h-full w-full object-cover"
            />
          </Blur>
        )}
        <div className="absolute top-6 right-6 left-6 flex w-fit items-center gap-4 rounded-full border border-white/20 bg-black/20 p-3 px-5 text-white shadow-xl drop-shadow-xs backdrop-blur-md">
          <div className="flex shrink-0 -space-x-2.5">
            {[1, 2, 3].map((item) => (
              <img
                key={item}
                className="h-8 w-8 rounded-full border-2 border-white/80 object-cover"
                src={`https://i.pravatar.cc/100?img=${item + 10}`}
                alt="Avatar"
              />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wide text-white">
              Hơn 10.000+ nhân tài đã tham gia
            </p>
            <p className="truncate text-[11px] font-light text-slate-200/90">
              Gia nhập cộng đồng SmartHire ngay hôm nay!
            </p>
          </div>
        </div>

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
    </div>
  );
}

export default SignUp;
