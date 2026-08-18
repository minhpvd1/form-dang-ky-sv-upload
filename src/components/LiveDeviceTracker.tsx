import React from "react";
import { Laptop, Monitor, Smartphone, Wifi, Radio, ShieldCheck } from "lucide-react";
import { PresenceDevice } from "../types";

interface LiveDeviceTrackerProps {
  devices: PresenceDevice[];
  currentDeviceId: string;
}

export const LiveDeviceTracker: React.FC<LiveDeviceTrackerProps> = ({
  devices,
  currentDeviceId,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Các Thiết Bị Đang Kết Nối ({devices.length})
            </h3>
            <p className="text-[10px] text-slate-400">
              Đồng bộ dữ liệu trực tiếp tức thì qua Firestore Cloud
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          Realtime
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {devices.map((dev) => {
          const isThisDevice = dev.deviceId === currentDeviceId;
          return (
            <div
              key={dev.deviceId}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                isThisDevice
                  ? "bg-indigo-950/40 border-indigo-500/60 shadow-sm"
                  : "bg-slate-950/60 border-slate-800/80"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-slate-200"
                  style={{ backgroundColor: `${dev.color}25`, border: `1px solid ${dev.color}60` }}
                >
                  <Laptop className="w-4 h-4" style={{ color: dev.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
                    {dev.deviceName}
                    {isThisDevice && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500 text-white font-mono shrink-0">
                        Máy Này
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{dev.branch || "Chi nhánh chung"}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
