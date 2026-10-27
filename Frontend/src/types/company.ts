export type CompanyVerificationStatus = "Verified" | "Pending" | "Rejected";
export type CompanyMemberRole = "Owner" | "Recruiter" | "Member";
export type CompanyMembershipStatus =
  | "Active"
  | "Suspended"
  | "Left"
  | "Inactive";

export interface CompanyMembershipSummary {
  role: CompanyMemberRole;
  status: CompanyMembershipStatus;
}

export interface CompanyItem {
  id: string;
  name: string;
  taxCode: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  logoFileId?: string | null;
  logoUrl: string | null;
  verificationStatus: CompanyVerificationStatus;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  membership?: CompanyMembershipSummary | null;
}

export interface CompanyMemberUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface CompanyMember {
  id: string;
  user: CompanyMemberUser;
  role: CompanyMemberRole;
  status: CompanyMembershipStatus;
  joinedAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  taxCode: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  logoFileId?: string;
  logoUrl?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  logoFileId?: string | null;
  logoUrl?: string | null;
}

export interface InviteRecruiterPayload {
  email: string;
  expiresAt?: string;
}

export type CompanyInvitationStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Expired";

export interface CompanyBriefSummary {
  id: string;
  name: string;
  verificationStatus: CompanyVerificationStatus;
  logoUrl?: string | null;
  address?: string | null;
  website?: string | null;
}

export interface CompanyInvitationInviterSummary {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface CompanyInvitationItem {
  id: string;
  companyId: string;
  inviterId: string;
  inviteeId: string;
  status: CompanyInvitationStatus;
  expiresAt: string;
  createdAt: string;
  company?: CompanyBriefSummary | null;
  inviter?: CompanyInvitationInviterSummary | null;
  inviterEmail?: string | null;
}

export interface AcceptInvitationMembershipResult {
  id: string;
  companyId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface AcceptInvitationResult {
  invitationId: string;
  invitationStatus: string;
  membership: AcceptInvitationMembershipResult;
}

export type CompanyJoinRequestStatus = "Pending" | "Approved" | "Rejected";

export interface CompanyJoinRequestUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface CompanyJoinRequestItem {
  id: string;
  companyId: string;
  userId: string;
  status: CompanyJoinRequestStatus;
  createdAt: string;
  user?: CompanyJoinRequestUser | null;
}

export interface ReviewJoinRequestPayload {
  status: "APPROVED" | "REJECTED";
}

export interface ReviewJoinRequestResult {
  requestId: string;
  companyId: string;
  status: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  membership?: {
    role: string;
    status: string;
  } | null;
}
