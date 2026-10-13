export const getLoremAvt = (name?: string): string => {
  if (!name) return "https://placehold.co/100x100?text=U";
  const words = name.trim().split(/\s+/);
  let initials = words[0].charAt(0).toUpperCase();
  if (words.length > 1) {
    initials += words[words.length - 1].charAt(0).toUpperCase();
  }

  return `https://placehold.co/100x100?text=${encodeURIComponent(initials)}`;
};

import { PATHS } from "@/constants/paths";

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
