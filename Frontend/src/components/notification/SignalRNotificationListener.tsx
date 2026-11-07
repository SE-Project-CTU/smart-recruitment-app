import { useSignalRNotification } from "@/hooks/useSignalRNotification";

/**
 * SignalRNotificationListener
 * Component ngầm không hiển thị giao diện, chịu trách nhiệm kích hoạt hook
 * lắng nghe thông báo real-time qua SignalR Hub khi người dùng đã đăng nhập.
 */
export function SignalRNotificationListener() {
  useSignalRNotification();
  return null;
}

export default SignalRNotificationListener;

