import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  if (!cachedApp) {
    cachedApp =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  if (!cachedAuth) {
    cachedAuth = getAuth(cachedApp);
  }

  return cachedAuth;
}

/**
 * Mở popup đăng nhập Google qua Firebase Auth và trả về Firebase ID Token.
 */
export async function signInWithGooglePopup(): Promise<string> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  // Luôn hiển thị bộ chọn tài khoản để chuyển đổi nhanh giữa Candidate và Recruiter
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(auth, provider);
  return await credential.user.getIdToken();
}

export function isFirebasePopupCancelled(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  return (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  );
}

export function getFirebaseAuthErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message === "FIREBASE_NOT_CONFIGURED") {
    return "Hệ thống chưa được cấu hình đăng nhập Google.";
  }

  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  switch (code) {
    case "auth/popup-blocked":
      return "Trình duyệt đã chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup và thử lại.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng khi xác thực Google. Vui lòng thử lại.";
    case "auth/unauthorized-domain":
      return "Tên miền hiện tại chưa được cấp phép xác thực trên Firebase.";
    case "auth/user-disabled":
      return "Tài khoản Google này hiện đang bị vô hiệu hóa.";
    case "auth/too-many-requests":
      return "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.";
    default:
      return "Không thể đăng nhập bằng Google. Vui lòng thử lại.";
  }
}

