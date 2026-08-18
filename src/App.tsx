import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Users,
  Plus,
  Wifi,
  Sparkles,
  Building2,
  MapPin,
  RefreshCw,
  Layers,
  CheckCircle2,
  Bell,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./lib/firebase";
import { MemberRecord, PresenceDevice, RealtimeActivity } from "./types";
import { soundManager } from "./utils/soundEffects";
import { LiveHeader } from "./components/LiveHeader";
import { MemberFormModal } from "./components/MemberFormModal";
import { MemberCard } from "./components/MemberCard";
import { MemberTable } from "./components/MemberTable";
import { LiveDeviceTracker } from "./components/LiveDeviceTracker";
import { RealtimeActivityFeed } from "./components/RealtimeActivityFeed";
import { StatsDashboard } from "./components/StatsDashboard";

export default function App() {
  // Device identity
  const [deviceId] = useState<string>(() => {
    const saved = localStorage.getItem("app_device_id");
    if (saved) return saved;
    const newId = "dev-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("app_device_id", newId);
    return newId;
  });

  const [deviceName] = useState<string>(() => {
    const saved = localStorage.getItem("app_device_name");
    if (saved) return saved;
    const branches = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Remote"];
    const chosenBranch = branches[Math.floor(Math.random() * branches.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const newName = `Máy #${num} (${chosenBranch})`;
    localStorage.setItem("app_device_name", newName);
    return newName;
  });

  // State
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [devices, setDevices] = useState<PresenceDevice[]>([]);
  const [activities, setActivities] = useState<RealtimeActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Audio State
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(soundManager.getIsMuted());
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(soundManager.getIsAmbientPlaying());

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [liveToast, setLiveToast] = useState<{ message: string; author: string } | null>(null);

  const isFirstLoad = useRef(true);

  // 1. Setup Presence (Đăng ký máy này vào danh sách Online trên Firestore)
  useEffect(() => {
    const colors = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
    const myColor = colors[Math.floor(Math.random() * colors.length)];

    const updatePresence = async () => {
      try {
        const presenceRef = doc(db, "presence", deviceId);
        await setDoc(
          presenceRef,
          {
            deviceId,
            deviceName,
            branch: deviceName.includes("(") ? deviceName.split("(")[1].replace(")", "") : "Chung",
            lastSeen: new Date().toISOString(),
            color: myColor,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Lỗi khi cập nhật presence:", err);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // Ping mỗi 30s

    return () => clearInterval(interval);
  }, [deviceId, deviceName]);

  // 2. Realtime Listeners for Members
  useEffect(() => {
    const q = collection(db, "members");
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: MemberRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        // Sắp xếp theo ngày tạo mới nhất
        list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

        // Nếu có thay đổi từ máy khác sau lần load đầu tiên, phát âm thanh đồng bộ Realtime
        if (!isFirstLoad.current && !snapshot.metadata.hasPendingWrites) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
              const data = change.doc.data() as MemberRecord;
              if (data.addedByDevice !== deviceName) {
                soundManager.playSyncChime();
                setLiveToast({
                  message: `${change.type === "added" ? "vừa thêm thành viên" : "vừa cập nhật"} "${data.fullName}"`,
                  author: data.addedByDevice || "Máy khác",
                });
                setTimeout(() => setLiveToast(null), 4500);
              }
            }
          });
        }

        setMembers(list);
        setLoading(false);
        isFirstLoad.current = false;
      },
      (error) => {
        console.error("Lỗi realtime members:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceName]);

  // 3. Realtime Listeners for Presence Devices
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "presence"), (snapshot) => {
      const list: PresenceDevice[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PresenceDevice);
      });
      setDevices(list);
    });

    return () => unsubscribe();
  }, []);

  // 4. Realtime Listeners for Activity Logs
  useEffect(() => {
    const q = query(collection(db, "activityLogs"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: RealtimeActivity[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setActivities(list);
    });

    return () => unsubscribe();
  }, []);

  // Seed sample members if database is empty
  const handleSeedSampleData = async () => {
    soundManager.playClickSound();
    const samples = [
      {
        fullName: "Nguyễn Hoàng Nam",
        memberCode: "MB-8801",
        email: "nam.nguyen@company.com",
        phone: "0988 123 456",
        role: "Trưởng Phòng Kỹ Thuật",
        department: "Công Nghệ & Kỹ Thuật (Tech / IT)",
        branchLocation: "Trụ Sở Chính - Hà Nội",
        status: "active",
        notes: "Phụ trách kiến trúc hệ thống và dữ liệu đám mây.",
      },
      {
        fullName: "Trần Thị Mai Phương",
        memberCode: "MB-8802",
        email: "phuong.tran@company.com",
        phone: "0909 234 567",
        role: "Chuyên Viên Kinh Doanh",
        department: "Kinh Doanh & Phát Triển (Sales & BD)",
        branchLocation: "Chi Nhánh - TP. Hồ Chí Minh",
        status: "active",
        notes: "Đạt giải Best Seller quý vừa qua.",
      },
      {
        fullName: "Lê Văn Tuấn",
        memberCode: "MB-8803",
        email: "tuan.le@company.com",
        phone: "0918 345 678",
        role: "Kỹ Sư Phần Mềm",
        department: "Công Nghệ & Kỹ Thuật (Tech / IT)",
        branchLocation: "Chi Nhánh - Đà Nẵng",
        status: "probation",
        notes: "Chuyên môn React, Node.js và Firebase.",
      },
      {
        fullName: "Phạm Quỳnh Chi",
        memberCode: "MB-8804",
        email: "chi.pham@company.com",
        phone: "0934 456 789",
        role: "Chuyên Viên Marketing",
        department: "Marketing & Truyền Thông",
        branchLocation: "Làm Việc Từ Xa (Remote)",
        status: "on_leave",
        notes: "Đang nghỉ phép đến hết tuần.",
      },
    ];

    try {
      const now = new Date().toISOString();
      for (const item of samples) {
        const docRef = doc(collection(db, "members"));
        await setDoc(docRef, {
          id: docRef.id,
          ...item,
          addedByDevice: deviceName,
          createdAt: now,
          updatedAt: now,
        });
      }
      soundManager.playSuccessChime();
    } catch (e) {
      console.error("Lỗi thêm dữ liệu mẫu:", e);
    }
  };

  // Delete Member Handler
  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ thành viên "${name}" khỏi toàn bộ hệ thống?`)) {
      return;
    }
    soundManager.playDeletePop();
    try {
      await deleteDoc(doc(db, "members", id));
      await addDoc(collection(db, "activityLogs"), {
        action: "delete",
        author: deviceName,
        targetName: name,
        details: "Xóa hồ sơ thành viên",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    soundManager.playClickSound();
    if (members.length === 0) {
      alert("Chưa có dữ liệu thành viên để xuất.");
      return;
    }

    const headers = ["Mã Thành Viên", "Họ và Tên", "Chức Vụ", "Phòng Ban", "Chi Nhánh", "Số Điện Thoại", "Email", "Trạng Thái", "Thiết Bị Nhập", "Ngày Tạo"];
    const rows = members.map((m) => [
      `"${m.memberCode || ""}"`,
      `"${m.fullName || ""}"`,
      `"${m.role || ""}"`,
      `"${m.department || ""}"`,
      `"${m.branchLocation || ""}"`,
      `"${m.phone || ""}"`,
      `"${m.email || ""}"`,
      `"${m.status || ""}"`,
      `"${m.addedByDevice || ""}"`,
      `"${m.createdAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Danh_Sach_Thanh_Vien_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === "all" || member.department === selectedDepartment;
    const matchesBranch = selectedBranch === "all" || member.branchLocation === selectedBranch;
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;

    return matchesSearch && matchesDept && matchesBranch && matchesStatus;
  });

  return (
    <div
      onClick={() => {
        // Tự động resume AudioContext khi click bất kỳ đâu
        soundManager.init();
      }}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-indigo-500 selection:text-white"
    >
      {/* Live Toast Notification when another device syncs */}
      {liveToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/50 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl text-xs text-slate-100 max-w-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shrink-0 shadow">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-amber-300">{liveToast.author}</p>
              <p className="text-slate-300">{liveToast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <LiveHeader
        onOpenCreateModal={() => {
          setEditingMember(null);
          setIsFormModalOpen(true);
        }}
        onlineCount={devices.length || 1}
        totalMembers={members.length}
        isSoundMuted={isSoundMuted}
        onToggleSound={() => {
          const muted = !isSoundMuted;
          soundManager.setMuted(muted);
          setIsSoundMuted(muted);
        }}
        isAmbientPlaying={isAmbientPlaying}
        onToggleAmbient={() => {
          const isPlaying = soundManager.toggleBackgroundAmbience();
          setIsAmbientPlaying(isPlaying);
        }}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onExportData={handleExportCSV}
        currentDeviceName={deviceName}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Realtime Device Tracker & Presence */}
        <LiveDeviceTracker devices={devices} currentDeviceId={deviceId} />

        {/* Stats Dashboard */}
        <StatsDashboard members={members} />

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, mã thành viên, số điện thoại, chức vụ..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Branch Filter */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">Tất Cả Chi Nhánh</option>
                <option value="Trụ Sở Chính - Hà Nội">Trụ Sở Hà Nội</option>
                <option value="Chi Nhánh - TP. Hồ Chí Minh">Chi Nhánh TP.HCM</option>
                <option value="Chi Nhánh - Đà Nẵng">Chi Nhánh Đà Nẵng</option>
                <option value="Chi Nhánh - Hải Phòng">Chi Nhánh Hải Phòng</option>
                <option value="Chi Nhánh - Cần Thơ">Chi Nhánh Cần Thơ</option>
                <option value="Làm Việc Từ Xa (Remote)">Từ Xa (Remote)</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="active">Đang làm việc</option>
                <option value="probation">Thử việc</option>
                <option value="on_leave">Nghỉ phép</option>
                <option value="inactive">Tạm ngưng</option>
              </select>

              {/* Reset Filters */}
              {(searchQuery || selectedBranch !== "all" || selectedStatus !== "all" || selectedDepartment !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBranch("all");
                    setSelectedStatus("all");
                    setSelectedDepartment("all");
                  }}
                  className="text-xs text-amber-400 hover:underline px-2"
                >
                  Xóa Lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Member List Grid or Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Danh Sách Hồ Sơ Thành Viên ({filteredMembers.length}/{members.length})
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              Đồng bộ trực tiếp giữa các máy
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
              <p className="text-sm">Đang kết nối và đồng bộ dữ liệu đám mây...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 space-y-4">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-200">Chưa có thành viên nào phù hợp</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Dữ liệu đang trống hoặc không khớp với bộ lọc. Bạn có thể thêm thành viên mới hoặc bấm nút bên dưới để tạo dữ liệu mẫu thử nghiệm đồng bộ ngay.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleSeedSampleData}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow"
                >
                  Tạo 4 Hồ Sơ Mẫu Thử Nghiệm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
                >
                  + Thêm Thủ Công
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={(m) => {
                    setEditingMember(m);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={handleDeleteMember}
                />
              ))}
            </div>
          ) : (
            <MemberTable
              members={filteredMembers}
              onEdit={(m) => {
                setEditingMember(m);
                setIsFormModalOpen(true);
              }}
              onDelete={handleDeleteMember}
            />
          )}
        </div>

        {/* Realtime Activity Stream Feed */}
        <RealtimeActivityFeed activities={activities} />
      </main>

      {/* Member Create/Edit Modal */}
      <MemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingMember}
        currentDeviceName={deviceName}
      />
    </div>
  );
}
