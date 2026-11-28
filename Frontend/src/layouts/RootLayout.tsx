import { Outlet } from "react-router-dom";
import { ApplyJobModal } from "@/components/job/ApplyJobModal";
import { SignalRNotificationListener } from "@/components/notification/SignalRNotificationListener";

/**
 * RootLayout:
 * Layout gốc bao bọc toàn bộ hệ thống định tuyến (React Router).
 * - Đảm bảo các component dịch vụ toàn cục (SignalR listener, ApplyJobModal, v.v.)
 *   luôn được mount duy nhất 1 lần trên mọi trang (kể cả các trang độc lập như CV Builder).
 */
export function RootLayout() {
  return (
    <>
      <SignalRNotificationListener />
      <Outlet />
      <ApplyJobModal />
    </>
  );
}

export default RootLayout;

