import React, { useState } from "react";
import { User } from "../types";

const AttendancePage: React.FC<{ user: User }> = ({ user }) => {
  const [status, setStatus] = useState<
    "idle" | "checking" | "success" | "failed"
  >("idle");
  const [error, setError] = useState("");

  const handleMarkAttendance = async () => {
    setStatus("checking");
    setError("");

    try {
      const res = await fetch("http://localhost:8000/attendance/mark", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: user.id,
          deviceId: "DEVICE_FINGERPRINT_X89",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("failed");
        setError(data.error || "Attendance verification failed");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("failed");
      setError("Unable to connect to attendance server.");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Hostel Attendance</h1>
          <p className="text-indigo-100 opacity-90">
            Secure • Network Verified • Tamper Proof
          </p>
        </div>

        <div className="p-10 text-center">
          {status === "idle" && (
            <button
              onClick={handleMarkAttendance}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Punch Attendance
            </button>
          )}

          {status === "checking" && (
            <div className="py-12">
              <div className="w-16 h-16 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-slate-600">
                Verifying hostel network & device…
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="py-8">
              <h3 className="text-2xl font-bold text-emerald-600">
                Attendance Marked ✔
              </h3>
              <p className="text-slate-500 mt-2">
                Verified at {new Date().toLocaleTimeString()}
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="py-8">
              <h3 className="text-xl font-bold text-red-600">
                Attendance Failed
              </h3>
              <p className="text-red-500 mt-3">{error}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t">
          <div className="flex justify-between text-xs text-slate-400 uppercase tracking-widest">
            <span>Room: {user.roomNumber}</span>
            <span>Block: {user.hostelBlock}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
