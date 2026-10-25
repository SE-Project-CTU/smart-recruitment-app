import React from "react";
import { Phone, Mail, Globe, MapPin, Calendar } from "lucide-react";
import type { CVProfile, CVFieldStyle } from "@/types/cv";
import { getFieldStyle } from "./utils";

interface ProfileHeaderProps {
  profile: CVProfile;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  fields,
  primaryColor = "#0F172A",
}) => {
  return (
    <div className="flex flex-col items-center border-b border-gray-200 pb-5 text-center">
      {/* Họ tên */}
      <h1
        className="text-2xl font-bold tracking-tight text-slate-900"
        style={getFieldStyle(fields, "profile.fullName", {
          fontSize: "24px",
          fontWeight: "bold",
          color: primaryColor,
        })}
      >
        {profile.fullName}
      </h1>

      {/* Chức danh nghề nghiệp */}
      {profile.title && (
        <h2
          className="mt-1 text-sm font-semibold tracking-wide text-slate-700"
          style={getFieldStyle(fields, "profile.title", {
            fontSize: "14px",
            fontWeight: "600",
            color: "#334155",
          })}
        >
          {profile.title}
        </h2>
      )}

      {/* Thông tin liên hệ dạng 1 dòng gọn gàng như ảnh mẫu */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
        {profile.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-800" />
            <span
              style={getFieldStyle(fields, "profile.phone", {
                fontSize: "12px",
              })}
            >
              {profile.phone}
            </span>
          </div>
        )}

        {profile.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-800" />
            <span
              style={getFieldStyle(fields, "profile.email", {
                fontSize: "12px",
              })}
            >
              {profile.email}
            </span>
          </div>
        )}

        {profile.website && (
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 shrink-0 text-slate-800" />
            <a
              href={
                profile.website.startsWith("http")
                  ? profile.website
                  : `https://${profile.website}`
              }
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
              style={getFieldStyle(fields, "profile.website", {
                fontSize: "12px",
              })}
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}

        {profile.address && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-800" />
            <span
              style={getFieldStyle(fields, "profile.address", {
                fontSize: "12px",
              })}
            >
              {profile.address}
            </span>
          </div>
        )}

        {profile.dob && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-800" />
            <span
              style={getFieldStyle(fields, "profile.dob", {
                fontSize: "12px",
              })}
            >
              {profile.dob}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
