import React from "react";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import type { CVProfile, CVFieldStyle } from "@/types/cv";
import { getFieldStyle } from "./utils";
import { EditableField } from "../../components/EditableField";

interface ProfileHeaderProps {
  profile?: CVProfile;
  fields?: Record<string, CVFieldStyle>;
  primaryColor?: string;
  isReadOnly?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  fields,
  primaryColor = "#0F172A",
  isReadOnly = false,
}) => {
  return (
    <div className="flex flex-col items-center px-4 text-center">
      {/* Họ tên: contentEditable WYSIWYG */}
      <h1
        className="text-2xl font-bold tracking-tight text-slate-900"
        style={getFieldStyle(fields, "profile.fullName", {
          fontSize: "24px",
          fontWeight: "bold",
          color: primaryColor,
        })}
      >
        <EditableField
          name="content.profile.fullName"
          placeholder="Họ và Tên"
          isReadOnly={isReadOnly}
        />
      </h1>

      {/* Chức danh nghề nghiệp: contentEditable */}
      <h2
        className="mt-1 text-sm font-semibold tracking-wide text-slate-700"
        style={getFieldStyle(fields, "profile.title", {
          fontSize: "14px",
          fontWeight: "600",
          color: "#334155",
        })}
      >
        <EditableField
          name="content.profile.title"
          placeholder="Chức danh nghề nghiệp"
          isReadOnly={isReadOnly}
        />
      </h2>

      {/* Thông tin liên hệ dạng 1 dòng gọn gàng như ảnh mẫu */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-800" />
          <EditableField
            name="content.profile.phone"
            placeholder="Số điện thoại"
            isReadOnly={isReadOnly}
            style={getFieldStyle(fields, "profile.phone", {
              fontSize: "12px",
            })}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-800" />
          <EditableField
            name="content.profile.email"
            placeholder="Email liên hệ"
            isReadOnly={isReadOnly}
            style={getFieldStyle(fields, "profile.email", {
              fontSize: "12px",
            })}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 shrink-0 text-slate-800" />
          <EditableField
            name="content.profile.website"
            placeholder="website.com"
            isReadOnly={isReadOnly}
            style={getFieldStyle(fields, "profile.website", {
              fontSize: "12px",
            })}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-800" />
          <EditableField
            name="content.profile.address"
            placeholder="Địa chỉ (Quận, Tỉnh/TP)"
            isReadOnly={isReadOnly}
            style={getFieldStyle(fields, "profile.address", {
              fontSize: "12px",
            })}
          />
        </div>
      </div>
    </div>
  );
};
