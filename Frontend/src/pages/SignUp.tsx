import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Office, OfficeGirl } from "@/assets/images/decoration";
import { SmartHire_default } from "@/assets/images/logo";
import Button from "@/components/Button";
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
import { authService } from "@/services/authService";
import { getApiErrorMessage } from "@/api/errorHandler";

function SignUp() {
  const navigate = useNavigate();

  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phoneNumber.trim(),
        password,
      };

      if (role === "candidate") {
        await authService.registerCandidate(payload);
      } else {
        await authService.registerRecruiter(payload);
      }

      toast.add({
        type: "success",
        description: "Đăng ký tài khoản thành công!",
      });

      navigate("/sign-in");
    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormFields = () => (
    <form className="p flex w-full flex-col gap-3.5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold text-text-main">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-5 text-text-muted">
            <User size={18} />
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            disabled={isLoading}
            required
            className="input-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold text-text-main">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <span className="flex items-center justify-center rounded-full bg-white px-4 text-xs font-bold text-text-muted shadow-sm">
            +84
          </span>
          <div className="relative flex flex-1 items-center">
            <span className="absolute left-5 text-text-muted">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="03268xxxxx"
              disabled={isLoading}
              required
              className="input-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold text-text-main">
          Địa chỉ Email <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-5 text-text-muted">
            <Mail size={18} />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email liên hệ"
            disabled={isLoading}
            required
            className="input-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-semibold text-text-main">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
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
            className="input-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-5 cursor-pointer text-text-muted transition-colors hover:text-text-main"
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <MorphIcon icon={showPassword ? EyeOff : Eye} />
          </button>
        </div>
      </div>

      <div className="mt-1 flex items-start gap-2 text-left">
        <input
          type="checkbox"
          id="agreeTerms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          disabled={isLoading}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-primary"
        />
        <label
          htmlFor="agreeTerms"
          className="cursor-pointer text-xs leading-tight text-text-muted"
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
        <div className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 transition-all">
          <AlertCircle size={18} className="shrink-0" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      <Button
        htmlType="submit"
        text={
          role === "recruiter"
            ? "Tạo tài khoản Nhà tuyển dụng"
            : "Tạo tài khoản Ứng viên"
        }
        isLoading={isLoading}
        className="mt-2 py-3.5! text-base! font-medium!"
      />
    </form>
  );

  return (
    <div className="mx-auto flex min-h-screen flex-col gap-6 bg-surface p-4 font-sans md:max-w-[90%] md:p-6 xl:flex-row">
      {/* Left */}
      <div className="flex w-full flex-col gap-6 xl:w-1/2">
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-border/40 bg-linear-to-br from-white via-secondary/40 to-secondary-dark/80 p-3 shadow-sm md:p-3 lg:px-20">
          <div className="mb-6 flex items-center gap-2">
            <Link to="/">
              <img src={SmartHire_default} alt="SmartHire Logo" />
            </Link>
          </div>

          <h1 className="mb-2 text-center text-3xl font-bold text-text-main md:text-4xl">
            Tạo tài khoản
          </h1>
          <p className="mb-6 max-w-sm text-center text-sm leading-relaxed text-text-muted md:text-base">
            Gia nhập nền tảng tuyển dụng thông minh hàng đầu
          </p>

          <Tabs
            defaultValue="candidate"
            onValueChange={(val) => {
              setRole(val as "candidate" | "recruiter");
              setErrorMessage(null);
            }}
            className="mb-4 w-full max-w-md"
          >
            <TabsList className="grid h-fit! w-full grid-cols-2 border border-border/20 bg-white/80 p-1 shadow-xs">
              <TabsTab
                value="candidate"
                className="flex cursor-pointer items-center justify-center gap-2 py-2.5 text-xs font-semibold text-text-muted transition-all data-[state=active]:bg-primary-dark data-[state=active]:text-white data-[state=active]:shadow-md md:text-sm"
              >
                <User size={16} />
                Ứng viên
              </TabsTab>
              <TabsTab
                value="recruiter"
                className="flex cursor-pointer items-center justify-center gap-2 py-2.5 text-xs font-semibold text-text-muted transition-all data-[state=active]:bg-primary-dark data-[state=active]:text-white data-[state=active]:shadow-md md:text-sm"
              >
                <Building2 size={16} />
                Nhà tuyển dụng
              </TabsTab>
            </TabsList>

            <TabsPanels className="mt-4 w-full">
              <TabsPanel value="candidate" className="w-full">
                {renderFormFields()}
              </TabsPanel>

              <TabsPanel value="recruiter" className="w-full">
                {renderFormFields()}
              </TabsPanel>
            </TabsPanels>
          </Tabs>

          <div className="mt-6 text-xs text-text-muted md:text-sm">
            Đã có tài khoản?{" "}
            <Link
              to="/sign-in"
              className="font-bold text-text-main transition-colors hover:text-primary"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
      {/* right */}
      <div className="relative hidden w-1/2 overflow-hidden rounded-[2.5rem] p-12 text-white shadow-lg xl:flex xl:flex-col xl:justify-between">
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
              alt="SmartHire Office Recruiter"
              className="bg-grid-cus absolute inset-0 h-full w-full object-cover"
            />
          </Blur>
        )}
        <div className="absolute top-6 right-6 left-6 flex w-fit items-center gap-4 rounded-full border border-white/20 bg-black/20 p-3 px-5 text-white shadow-xl backdrop-blur-md">
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
            <p className="text-xs font-bold tracking-wide text-white drop-shadow-xs">
              Hơn 10.000+ nhân tài đã tham gia
            </p>
            <p className="truncate text-[11px] font-light text-slate-200/90">
              Gia nhập cộng đồng SmartHire ngay hôm nay!
            </p>
          </div>
        </div>

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

export default SignUp;
