import React from "react";
import {
  Users,
  Plus,
  Volume2,
  VolumeX,
  Music,
  Radio,
  Download,
  Wifi,
  Sparkles,
  Layers,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { soundManager } from "../utils/soundEffects";

interface LiveHeaderProps {
  onOpenCreateModal: () => void;
  onlineCount: number;
  totalMembers: number;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  isAmbientPlaying: boolean;
  onToggleAmbient: () => void;
  viewMode: "grid" | "table";
  onChangeViewMode: (mode: "grid" | "table") => void;
  onExportData: () => void;
  currentDeviceName: string;
}

export const LiveHeader: React.FC<LiveHeaderProps> = ({
  onOpenCreateModal,
  onlineCount,
  totalMembers,
  isSoundMuted,
  onToggleSound,
  isAmbientPlaying,
  onToggleAmbient,
  viewMode,
  onChangeViewMode,
  onExportData,
  currentDeviceName,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 py-3.5 shadow-xl transition-all">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Sync Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-lg shadow-indigo-500/20">
            <Users className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                HỆ THỐNG ĐỒNG BỘ ĐA THIẾT BỊ
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Wifi className="w-2.5 h-2.5" />
                Đám Mây Thời Gian Thực
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Thiết bị này: <span className="text-amber-300 font-semibold">{currentDeviceName}</span> •{" "}
              <span className="text-emerald-400 font-semibold">{onlineCount} máy</span> đang kết nối đồng bộ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Sound Mute/Unmute Toggle */}
          <button
            type="button"
            id="btn-toggle-sound"
            onClick={() => {
              onToggleSound();
              soundManager.playClickSound();
            }}
            title={isSoundMuted ? "Âm thanh đang TẮT - Bấm để BẬT" : "Âm thanh đang BẬT - Bấm để TẮT"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              !isSoundMuted
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {!isSoundMuted ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{!isSoundMuted ? "Âm Thanh: BẬT" : "Âm Thanh: TẮT"}</span>
          </button>

          {/* Ambient Background Music */}
          <button
            type="button"
            id="btn-toggle-ambient"
            onClick={() => {
              onToggleAmbient();
              soundManager.playClickSound();
            }}
            title="Nhạc nền thư giãn nhẹ nhàng"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isAmbientPlaying
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Music className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">{isAmbientPlaying ? "Nhạc Nền: Đang Phát" : "Nhạc Nền"}</span>
          </button>

          {/* View Mode Grid/Table */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              id="btn-view-grid"
              onClick={() => {
                onChangeViewMode("grid");
                soundManager.playClickSound();
              }}
              title="Xem dạng thẻ (Grid)"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-view-table"
              onClick={() => {
                onChangeViewMode("table");
                soundManager.playClickSound();
              }}
              title="Xem dạng bảng (Table)"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export Data */}
          <button
            type="button"
            id="btn-export-data"
            onClick={() => {
              onExportData();
              soundManager.playClickSound();
            }}
            title="Xuất file danh sách (CSV / Excel)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden lg:inline">Xuất File</span>
          </button>

          {/* Add New Member CTA */}
          <button
            type="button"
            id="btn-open-create-member"
            onClick={() => {
              onOpenCreateModal();
              soundManager.playClickSound();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-600 to-amber-500 text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>
    </header>
  );
};
