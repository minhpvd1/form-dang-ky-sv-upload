import React from "react";
import { Activity, PlusCircle, Edit3, Trash2, Clock, Sparkles } from "lucide-react";
import { RealtimeActivity } from "../types";

interface RealtimeActivityFeedProps {
  activities: RealtimeActivity[];
}

export const RealtimeActivityFeed: React.FC<RealtimeActivityFeedProps> = ({ activities }) => {
  const getActionIcon = (action: RealtimeActivity["action"]) => {
    switch (action) {
      case "create":
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case "update":
        return <Edit3 className="w-3.5 h-3.5 text-indigo-400" />;
      case "delete":
        return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "Vừa xong";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">
              Nhật Ký Đồng Bộ Thời Gian Thực ({activities.length})
            </h3>
            <p className="text-[10px] text-slate-400">
              Thông báo cập nhật ngay lập tức khi bất kỳ thành viên nào thao tác
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Chưa có hoạt động mới nào.</p>
        ) : (
          activities.slice(0, 10).map((act) => (
            <div
              key={act.id}
              className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2 text-xs"
            >
              <div className="flex items-start gap-2 min-w-0">
                <div className="mt-0.5 shrink-0 p-1 rounded-md bg-slate-900 border border-slate-800">
                  {getActionIcon(act.action)}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 truncate font-medium">
                    <strong className="text-amber-300">{act.author}</strong> đã{" "}
                    {act.action === "create" ? "thêm mới" : act.action === "update" ? "cập nhật" : "xóa"}{" "}
                    <span className="text-indigo-300 font-semibold">{act.targetName}</span>
                  </p>
                  {act.details && <p className="text-[10px] text-slate-400 truncate">{act.details}</p>}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 shrink-0 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(act.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
