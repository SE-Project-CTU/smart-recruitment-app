import { PATHS } from "@/constants/paths";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

export const getLoremAvt = (name?: string): string => {
  if (!name) return "https://placehold.co/100x100?text=U";
  const words = name.trim().split(/\s+/);
  let initials = words[0].charAt(0).toUpperCase();
  if (words.length > 1) {
    initials += words[words.length - 1].charAt(0).toUpperCase();
  }

  return `https://placehold.co/100x100?text=${encodeURIComponent(initials)}`;
};

export const getDashboardPathByRole = (role?: string): string => {
  switch (role?.toLowerCase()) {
    case "candidate":
      return PATHS.CANDIDATE.DASHBOARD;
    case "recruiter":
      return PATHS.RECRUITER.DASHBOARD;
    case "admin":
      return PATHS.ADMIN.DASHBOARD;
    default:
      return PATHS.HOME;
  }
};

export const getProfilePathByRole = (role: string): string => {
  switch (role) {
    case "recruiter":
    case "hr":
      return PATHS.RECRUITER.USER_PROFILE;
    case "admin":
    case "superadmin":
      return PATHS.ADMIN.USER_PROFILE;
    case "candidate":
    default:
      return PATHS.CANDIDATE.USER_PROFILE;
  }
};

dayjs.extend(relativeTime);
dayjs.locale("vi");
export const getTimeAgo = (isoString: string): string => {
  if (!isoString) return "";

  const now = dayjs();
  const targetDate = dayjs(isoString);
  const diffInHours = now.diff(targetDate, "hour");

  if (diffInHours < 1) {
    const diffInMinutes = now.diff(targetDate, "minute");
    if (diffInMinutes <= 1) return "Vừa xong";
    return `${diffInMinutes} phút trước`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  return targetDate.fromNow();
};

/**
 * Trả về lời chào theo thời gian trong ngày (Buổi sáng / Buổi trưa / Buổi chiều / Buổi tối)
 */
export const getTimeOfDayGreeting = (name?: string): string => {
  const hour = dayjs().hour();
  let session = "Buổi tối";
  if (hour >= 5 && hour < 11) {
    session = "Buổi sáng";
  } else if (hour >= 11 && hour < 13) {
    session = "Buổi trưa";
  } else if (hour >= 13 && hour < 18) {
    session = "Buổi chiều";
  }

  return name ? `${session} tốt lành, ${name}!` : `${session} tốt lành!`;
};
