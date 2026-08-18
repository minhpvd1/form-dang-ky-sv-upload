import React from "react";
import { Users, Building2, MapPin, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { MemberRecord } from "../types";

interface StatsDashboardProps {
  members: MemberRecord[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ members }) => {
  const activeCount = members.filter((m) => m.status === "active").length;
  const probationCount = members.filter((m) => m.status === "probation").length;
  const onLeaveCount = members.filter((m) => m.status === "on_leave").length;
  
  // Distinct branches
  const branches = Array.from(new Set(members.map((m) => m.branchLocation).filter(Boolean)));
  const departments = Array.from(new Set(members.map((m) => m.department).filter(Boolean)));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Total Members */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Tổng Thành Viên</span>
          <Users className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-extrabold text-white tracking-tight">{members.length}</div>
        <div className="text-[10px] text-slate-500 font-mono">Đồng bộ toàn hệ thống</div>
      </div>

      {/* 2. Active Now */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Đang Làm Việc</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">{activeCount}</div>
        <div className="text-[10px] text-emerald-500/80 font-medium">
          {probationCount > 0 ? `+${probationCount} thử việc` : "Sẵn sàng nhận nhiệm vụ"}
        </div>
      </div>

      {/* 3. Branches */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Chi Nhánh / Vị Trí</span>
          <MapPin className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-2xl font-extrabold text-rose-400 tracking-tight">{branches.length || 1}</div>
        <div className="text-[10px] text-slate-500 truncate">Hà Nội, TP.HCM, Đà Nẵng...</div>
      </div>

      {/* 4. Departments */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Phòng Ban</span>
          <Building2 className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-extrabold text-amber-400 tracking-tight">{departments.length || 1}</div>
        <div className="text-[10px] text-slate-500 truncate">Kỹ thuật, Kinh doanh, CSKH...</div>
      </div>
    </div>
  );
};
