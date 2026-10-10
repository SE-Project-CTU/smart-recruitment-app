import { Office } from "@/assets/images/decoration";
import { SmartHire_default } from "@/assets/images/logo";
import Button from "@/components/Button";
import { Lock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

function SignIn() {
  return (
    <div className="mx-auto flex min-h-screen flex-col gap-6 bg-surface p-4 font-sans md:max-w-[90%] md:p-6 xl:flex-row">
      <div className="flex w-full flex-col gap-6 xl:w-1/2">
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-border/40 bg-linear-to-br from-white via-secondary/40 to-secondary-dark/80 p-8 shadow-sm md:p-12 lg:px-24">
          <div className="mb-10 flex items-center gap-2">
            <img src={SmartHire_default} />
          </div>

          <h1 className="text-text mb-4 text-center text-3xl font-bold md:text-4xl">
            Say hello to SmartHire!
          </h1>
          <p className="mb-10 max-w-sm text-center text-sm leading-relaxed text-text-muted md:text-base">
            Chào mừng bạn đến với hệ sinh thái tuyển dụng tất cả trong một, tạm
            biệt cách làm truyền thống phức tạp
          </p>

          <form
            className="flex w-full max-w-md flex-col gap-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex items-center">
              <span className="absolute left-5 text-text-muted">
                <UserRound />
              </span>
              <input
                type="email"
                placeholder="Email"
                className="text-text w-full rounded-full border-none bg-white py-4 pr-6 pl-14 text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-5 text-text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="text-text w-full rounded-full border-none bg-white py-4 pr-6 pl-14 text-sm shadow-sm transition-all outline-none focus:ring-2 focus:ring-primary/50"
              />
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
              text="Đăng nhập"
              className="py-4! text-base! font-medium!"
            />
            <button
              type="button"
              className="text-text flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-white py-4 font-medium shadow-sm transition-all hover:bg-gray-50"
            >
              Đăng nhập Google
            </button>
          </form>

          <div className="mt-8 text-xs text-text-muted md:text-sm">
            Bạn là người mới?{" "}
            <Link
              to={"sign-up"}
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
