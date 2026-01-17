
export type ComplaintCategory = 'safety' | 'electrical' | 'plumbing' | 'wifi' | 'cleanliness' | 'other';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'escalated';

export interface MLComponents {
  severity: number;
  frequency: number;
  urgency: number;
  timeFactor: number;
  impactMultiplier: number;
  frustration: number;
  emotion: string;
}

export interface Complaint {
  id: string;
  studentName: string;
  studentId: string;
  roomNumber: string;
  hostelBlock: string; // Added to track distribution
  category: ComplaintCategory;
  description: string;
  location: string;
  createdAt: string;
  status: ComplaintStatus;
  priorityScore: number;
  explanation: string;
  mlComponents: MLComponents;
  affectedCount: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  timestamp: string;
  ipAddress: string;
  deviceId: string;
  isHostelWifi: boolean;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'student' | 'admin';
  hostelBlock: string;
  roomNumber: string;
}
