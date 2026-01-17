import { Complaint, AttendanceRecord } from "../types";

const COMPLAINTS_KEY = "hostelsmart_complaints";
const ATTENDANCE_KEY = "hostelsmart_attendance";

export const storage = {
  getComplaints(): Complaint[] {
    const data = localStorage.getItem(COMPLAINTS_KEY);
    return data ? JSON.parse(data) : []; // ✅ EMPTY, NOT MOCK
  },

  saveComplaint(complaint: Complaint) {
    const complaints = storage.getComplaints();

    const index = complaints.findIndex((c) => c.id === complaint.id);
    if (index >= 0) {
      complaints[index] = complaint;
    } else {
      complaints.unshift(complaint);
    }

    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  },

  getAttendance(): AttendanceRecord[] {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAttendance(record: AttendanceRecord) {
    const history = storage.getAttendance();
    history.unshift(record);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(history));
  },
};
