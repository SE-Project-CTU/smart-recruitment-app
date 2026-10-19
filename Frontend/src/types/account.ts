import type { UserRole } from "./auth";

export interface UserAccount {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  roles: UserRole[];
  status: "Active" | "Inactive" | "Locked" | string;
  createdAt?: string;
  updatedAt?: string;
}
