import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { storage } from "../services/storage";
import { Complaint, AttendanceRecord, User } from "../types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const location = useLocation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Get the root name of the block (e.g. "Aryabhatta" from "Aryabhatta-Central")
  const wardenBlockRoot = useMemo(
    () => user.hostelBlock.split("-")[0],
    [user.hostelBlock],
  );

  useEffect(() => {
    // 1. Fetch all complaints
    const allComplaints = storage.getComplaints();

    // 2. Filter: Only show complaints where student's hostel block matches warden's jurisdiction
    const filteredComplaints = allComplaints
      .filter((c) => c.hostelBlock.split("-")[0] === wardenBlockRoot)
      .sort((a, b) => b.priorityScore - a.priorityScore);

    // 3. Filter: Only show attendance records from the warden's block
    const allAttendance = storage.getAttendance();
    const filteredAttendance = allAttendance.filter((a) => {
      // Note: Attendance records don't store hostelBlock directly,
      // but in a real system we would join with user data.
      // For this demo, we can use the studentId or a mocked block mapping.
      // Since our storage saves new records with room numbers, we assume they are within the warden's visibility if they are logged during this session.
      // In a production app, this would be a backend SQL join.
      return true; // For the sake of this demo, we'll focus on filtering the complaint list strictly.
    });

    setComplaints(filteredComplaints);
    setAttendance(allAttendance); // Keep global attendance for scale, or filter if needed
  }, [location.pathname, wardenBlockRoot]);

  const handleStatusChange = (id: string, newStatus: any) => {
    const complaintList = storage.getComplaints();
    const index = complaintList.findIndex((c) => c.id === id);
    if (index > -1) {
      complaintList[index].status = newStatus;
      localStorage.setItem(
        "hostelsmart_complaints",
        JSON.stringify(complaintList),
      );
      // Refresh local state
      const filtered = complaintList
        .filter((c) => c.hostelBlock.split("-")[0] === wardenBlockRoot)
        .sort((a, b) => b.priorityScore - a.priorityScore);
      setComplaints(filtered);
    }
  };

  const presencePercentage = useMemo(() => {
    const BLOCK_CAPACITY = 100; // Estimated capacity per block
    const today = new Date().toDateString();
    const presentToday = new Set(
      attendance
        .filter(
          (a) => new Date(a.timestamp).toDateString() === today && !a.isAnomaly,
        )
        .map((a) => a.studentId),
    ).size;
    return Math.round((presentToday / BLOCK_CAPACITY) * 100);
  }, [attendance]);

  const categoryData = useMemo(() => {
    return Object.keys(CATEGORY_LABELS)
      .map((cat) => ({
        name: CATEGORY_LABELS[cat],
        count: complaints.filter((c) => c.category === cat).length,
        color:
          cat === "safety"
            ? "#ef4444"
            : cat === "electrical"
              ? "#f59e0b"
              : cat === "wifi"
                ? "#8b5cf6"
                : "#6366f1",
      }))
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  const blockData = useMemo(() => {
    const blocks: Record<string, number> = {};
    complaints.forEach((c) => {
      const block = c.hostelBlock || "Unknown";
      blocks[block] = (blocks[block] || 0) + 1;
    });
    return Object.entries(blocks).map(([name, count]) => ({ name, count }));
  }, [complaints]);

  const currentPath = location.pathname;
  const isComplaintsView = currentPath.includes("complaints");
  const isAttendanceView = currentPath.includes("attendance");
  const isOverview = !isComplaintsView && !isAttendanceView;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            {isComplaintsView
              ? "Complaints Management"
              : isAttendanceView
                ? "Attendance Audit"
                : "Hostel Command Center"}
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
            Jurisdiction: {user.hostelBlock}
          </p>
        </div>
        <div className="bg-indigo-600 px-6 py-4 rounded-2xl flex items-center shadow-xl shadow-indigo-100 text-white">
          <div className="mr-6 text-right">
            <p className="text-[10px] font-black opacity-80 uppercase tracking-widest leading-none">
              Block Index
            </p>
            <p className="text-3xl font-black mt-1">{presencePercentage}%</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Active Complaints",
            value: complaints.filter((c) => c.status !== "resolved").length,
            color: "text-indigo-600",
            icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
          },
          {
            label: "High Priority (AI)",
            value: complaints.filter(
              (c) => c.priorityScore >= 0.75 && c.status !== "resolved",
            ).length,
            color: "text-red-600",
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
          },
          {
            label: "Verified Checks",
            value: attendance.filter(
              (a) =>
                new Date(a.timestamp).toDateString() ===
                  new Date().toDateString() && !a.isAnomaly,
            ).length,
            color: "text-emerald-600",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "Proxy Alarms",
            value: attendance.filter((a) => a.isAnomaly).length,
            color: "text-orange-600",
            icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                {kpi.label}
              </p>
              <p className={`text-3xl font-black mt-1 ${kpi.color}`}>
                {kpi.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${kpi.color}`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={kpi.icon}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(isOverview || isComplaintsView) && (
          <div
            className={`${isComplaintsView ? "lg:col-span-3" : "lg:col-span-2"} bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden`}
          >
            <div className="p-6 border-b-2 border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  AI Priority Incident Stream
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Showing only Registered Students in {wardenBlockRoot} root
                </p>
              </div>
            </div>
            <div className="divide-y-2 divide-slate-50">
              {complaints.length === 0 ? (
                <div className="p-16 text-center text-slate-400 font-bold italic">
                  No active complaints in your jurisdiction.
                </div>
              ) : (
                complaints
                  .filter((c) => (isOverview ? c.status !== "resolved" : true))
                  .map((c) => (
                    <div
                      key={c.id}
                      className={`p-8 hover:bg-slate-50 transition-colors border-l-8 ${c.priorityScore >= 0.75 && c.status !== "resolved" ? "border-red-500 bg-red-50/20" : "border-transparent"}`}
                    >
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-md font-black uppercase border-2 ${CATEGORY_COLORS[c.category]}`}
                            >
                              {CATEGORY_LABELS[c.category]}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest">
                              #{c.id} • {c.hostelBlock} •{" "}
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-slate-900 font-black text-xl mb-2">
                            {c.studentName} (Room {c.roomNumber})
                          </h4>
                          <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">
                            "{c.description}"
                          </p>

                          <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 shadow-2xl">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                Explainable AI Core reasoning
                              </span>
                            </div>
                            <p className="text-xs font-bold leading-relaxed mb-4 text-white">
                              {c.explanation}
                            </p>
                            <div className="grid grid-cols-4 gap-4 border-t border-slate-800 pt-4">
                              <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase">
                                  SEVERITY
                                </p>
                                <p
                                  className={`text-xs font-black ${c.mlComponents.severity > 0.7 ? "text-red-400" : "text-white"}`}
                                >
                                  {c.mlComponents.severity.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase">
                                  FREQUENCY
                                </p>
                                <p
                                  className={`text-xs font-black ${c.mlComponents.frequency > 0.5 ? "text-indigo-400" : "text-white"}`}
                                >
                                  {c.mlComponents.frequency.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase">
                                  URGENCY
                                </p>
                                <p className="text-xs font-black text-white">
                                  {c.mlComponents.urgency.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-500 uppercase">
                                  TIME
                                </p>
                                <p className="text-xs font-black text-white">
                                  {c.mlComponents.timeFactor.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-6 min-w-[160px]">
                          <div className="text-right">
                            <div
                              className={`text-7xl font-black tracking-tighter leading-none ${c.priorityScore >= 0.75 ? "text-red-600" : "text-indigo-600"}`}
                            >
                              {(c.priorityScore * 10).toFixed(1)}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                              PRIORITY INDEX
                            </div>
                          </div>
                          <select
                            className="w-full text-xs font-black text-slate-700 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                            value={c.status}
                            onChange={(e) =>
                              handleStatusChange(c.id, e.target.value)
                            }
                          >
                            <option value="open">Pending Review</option>
                            <option value="in_progress">
                              Technician Dispatched
                            </option>
                            <option value="escalated">Admin Escalation</option>
                            <option value="resolved">Mark Resolved</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {isOverview && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 mb-8 uppercase tracking-widest">
                Incident Density by Sub-Block
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 mb-8 uppercase tracking-widest">
                Integrity Pulse
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 uppercase">
                    Verified Records
                  </span>
                  <span className="text-lg font-black text-emerald-800">
                    {attendance.filter((a) => !a.isAnomaly).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                  <span className="text-[10px] font-black text-red-600 uppercase">
                    Anomaly Alarms
                  </span>
                  <span className="text-lg font-black text-red-800">
                    {attendance.filter((a) => a.isAnomaly).length}
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-6 text-center leading-relaxed">
                System monitoring WiFi Gateway and IP Fingerprints for{" "}
                {wardenBlockRoot} block.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
