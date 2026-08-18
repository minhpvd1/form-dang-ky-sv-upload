export interface MemberRecord {
  id: string;
  fullName: string;
  memberCode: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  branchLocation: string;
  status: "active" | "on_leave" | "probation" | "inactive";
  notes?: string;
  avatarUrl?: string;
  addedByDevice: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresenceDevice {
  deviceId: string;
  deviceName: string;
  branch: string;
  ipMock?: string;
  lastSeen: string;
  color: string;
}

export interface RealtimeActivity {
  id: string;
  action: "create" | "update" | "delete" | "status_change";
  author: string;
  targetName: string;
  timestamp: string;
  details?: string;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  playBackgroundAmbience: boolean;
  ambientType: "subtle-lofi" | "coastal-breeze" | "cyber-stream";
}
