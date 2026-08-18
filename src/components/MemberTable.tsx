import React from "react";
import {
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  Laptop,
} from "lucide-react";
import { MemberRecord } from "../types";
import { soundManager } from "../utils/soundEffects";

interface MemberTableProps {
  members: MemberRecord[];
  onEdit: (member: MemberRecord) => void;
  onDelete: (id: string, name: string) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({ members, onEdit, onDelete }) => {
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Họ và Tên</th>
              <th className="px-4 py-3.5">Mã / Chức Vụ</th>
              <th className="px-4 py-3.5">Phòng Ban</th>
              <th className="px-4 py-3.5">Chi Nhánh</th>
              <th className="px-4 py-3.5">Liên Hệ</th>
              <th className="px-4 py-3.5">Trạng Thái</th>
              <th className="px-4 py-3.5">Thiết Bị Nhập</th>
              <th className="px-4 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {member.fullName}
                      </div>
                      {member.notes && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {member.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Member Code & Role */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-200">{member.role}</div>
                  <div className="text-[10px] font-mono text-amber-400">{member.memberCode}</div>
                </td>

                {/* Department */}
                <td className="px-4 py-3 text-slate-300">
                  <span className="truncate max-w-[140px] block">{member.department}</span>
                </td>

                {/* Branch */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{member.branchLocation}</span>
                  </div>
                </td>

                {/* Contacts */}
                <td className="px-4 py-3 font-mono text-[11px]">
                  {member.phone && <div className="text-emerald-400">{member.phone}</div>}
                  {member.email && <div className="text-sky-400 text-[10px] truncate max-w-[140px]">{member.email}</div>}
                </td>

                {/* Status */}
                <td className="px-4 py-3">{getStatusBadge(member.status)}</td>

                {/* Added by device */}
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Laptop className="w-3 h-3 text-amber-400 shrink-0" />
                    {member.addedByDevice || "Chưa rõ"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClickSound();
                        onEdit(member);
                      }}
                      title="Sửa"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(member.id, member.fullName)}
                      title="Xóa"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
