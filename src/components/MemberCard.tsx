import React from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Laptop,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MemberRecord } from "../types";
import { soundManager } from "../utils/soundEffects";

interface MemberCardProps {
  member: MemberRecord;
  onEdit: (member: MemberRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit, onDelete }) => {
  const getStatusBadge = (status: MemberRecord["status"]) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Đang Làm Việc</span>;
      case "probation":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Thử Việc</span>;
      case "on_leave":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">Nghỉ Phép</span>;
      case "inactive":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">Tạm Ngưng</span>;
      default:
        return null;
    }
  };

  return (
    <div
      id={`member-card-${member.id}`}
      className="group relative rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header: Name + Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-sm">
              {member.fullName ? member.fullName.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {member.fullName}
              </h4>
              <p className="text-[11px] text-amber-400 font-mono">{member.memberCode || "Chưa có mã"}</p>
            </div>
          </div>
          <div>{getStatusBadge(member.status)}</div>
        </div>

        {/* Role & Department */}
        <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            {member.role}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{member.department}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span className="truncate">{member.branchLocation}</span>
          </div>
        </div>

        {/* Contacts */}
        <div className="mt-3 space-y-1 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60 text-[11px]">
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className="text-emerald-400 hover:underline flex items-center gap-1.5 font-mono"
            >
              <Phone className="w-3 h-3" />
              {member.phone}
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="text-sky-400 hover:underline flex items-center gap-1.5 truncate"
            >
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{member.email}</span>
            </a>
          )}
          {member.notes && (
            <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2 bg-slate-900/60 p-1 rounded">
              "{member.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Footer Meta & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1 truncate font-mono">
          <Laptop className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">Máy: {member.addedByDevice || "Chưa rõ"}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              onEdit(member);
            }}
            title="Chỉnh sửa"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(member.id, member.fullName);
            }}
            title="Xóa hồ sơ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
