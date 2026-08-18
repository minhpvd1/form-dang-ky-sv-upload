import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MemberRecord } from "../types";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { soundManager } from "../utils/soundEffects";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MemberRecord | null;
  currentDeviceName: string;
}

const DEPARTMENTS = [
  "Công Nghệ & Kỹ Thuật (Tech / IT)",
  "Kinh Doanh & Phát Triển (Sales & BD)",
  "Marketing & Truyền Thông",
  "Tài Chính & Kế Toán",
  "Nhân Sự & Đào Tạo (HR)",
  "Chăm Sóc Khách Hàng (Support)",
  "Vận Hành & Logistics",
  "Ban Điều Hành (Executive)",
];

const BRANCHES = [
  "Trụ Sở Chính - Hà Nội",
  "Chi Nhánh - TP. Hồ Chí Minh",
  "Chi Nhánh - Đà Nẵng",
  "Chi Nhánh - Hải Phòng",
  "Chi Nhánh - Cần Thơ",
  "Làm Việc Từ Xa (Remote)",
];

const ROLES = [
  "Giám Đốc / Điều Hành",
  "Trưởng Phòng / Quản Lý",
  "Kỹ Sư Phần Mềm",
  "Chuyên Viên Kinh Doanh",
  "Chuyên Viên Marketing",
  "Kế Toán Viên",
  "Nhân Viên CSKH",
  "Thực Tập Sinh",
  "Cộng Tác Viên",
];

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  currentDeviceName,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    fullName: "",
    memberCode: "",
    email: "",
    phone: "",
    role: ROLES[2],
    department: DEPARTMENTS[0],
    branchLocation: BRANCHES[0],
    status: "active" as MemberRecord["status"],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        memberCode: initialData.memberCode || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role || ROLES[2],
        department: initialData.department || DEPARTMENTS[0],
        branchLocation: initialData.branchLocation || BRANCHES[0],
        status: initialData.status || "active",
        notes: initialData.notes || "",
      });
    } else {
      // Auto generate sample member code
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        fullName: "",
        memberCode: `MB-${randNum}`,
        email: "",
        phone: "",
        role: ROLES[2],
        department: DEPARTMENTS[0],
        branchLocation: BRANCHES[0],
        status: "active",
        notes: "",
      });
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên thành viên.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const now = new Date().toISOString();

      if (isEditing && initialData?.id) {
        // Update existing document
        const memberRef = doc(db, "members", initialData.id);
        await setDoc(
          memberRef,
          {
            ...formData,
            updatedAt: now,
          },
          { merge: true }
        );

        // Record activity log for other devices
        await addDoc(collection(db, "activityLogs"), {
          action: "update",
          author: currentDeviceName,
          targetName: formData.fullName,
          details: `Cập nhật thông tin thành viên [${formData.role} - ${formData.branchLocation}]`,
          timestamp: now,
        });
      } else {
        // Create new document
        const newMemberRef = doc(collection(db, "members"));
        const newRecord: MemberRecord = {
          id: newMemberRef.id,
          ...formData,
          addedByDevice: currentDeviceName,
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(newMemberRef, newRecord);

        // Record activity log for all other connected devices
        await addDoc(collection(db, "activityLogs"), {
          action: "create",
          author: currentDeviceName,
          targetName: formData.fullName,
          details: `Thêm thành viên mới [${formData.role} - ${formData.branchLocation}]`,
          timestamp: now,
        });
      }

      // Success Sound & Confetti
      soundManager.playSuccessChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      onClose();
    } catch (err: any) {
      console.error("Lỗi khi lưu dữ liệu lên Firestore:", err);
      setErrorMsg(err?.message || "Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="member-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {isEditing ? "Chỉnh Sửa Hồ Sơ Thành Viên" : "Thêm Thành Viên & Đồng Bộ Đa Máy"}
              </h3>
              <p className="text-xs text-slate-400">
                Dữ liệu sẽ được lưu trên đám mây và đồng bộ tức thì đến tất cả thiết bị khác
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Họ và Tên <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Member Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                Mã Thành Viên / Định Danh
              </label>
              <input
                type="text"
                value={formData.memberCode}
                onChange={(e) => setFormData({ ...formData, memberCode: e.target.value })}
                placeholder="MB-1024"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Số Điện Thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912 345 678"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nguyenvanan@company.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                Chức Vụ / Vị Trí
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-fuchsia-400" />
                Phòng Ban
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-fuchsia-500 focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Chi Nhánh / Địa Điểm
              </label>
              <select
                value={formData.branchLocation}
                onChange={(e) => setFormData({ ...formData, branchLocation: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-rose-500 focus:outline-none"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                Trạng Thái Hoạt Động
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
              >
                <option value="active">🟢 Đang làm việc (Active)</option>
                <option value="probation">🟡 Đang thử việc (Probation)</option>
                <option value="on_leave">🔵 Đang nghỉ phép (On Leave)</option>
                <option value="inactive">⚪ Tạm ngưng (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Ghi Chú Công Việc / Chi Tiết Thêm
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú về dự án phụ trách, ca làm việc hoặc lưu ý chung..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              Nhập từ thiết bị: <strong className="text-amber-300">{currentDeviceName}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-600 to-amber-500 text-white shadow-lg hover:opacity-95 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Đang đồng bộ..." : isEditing ? "Cập Nhật" : "Lưu & Đồng Bộ Ngay"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
