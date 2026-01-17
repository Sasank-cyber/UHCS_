
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { Complaint, User, AttendanceRecord } from '../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../constants';

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    setComplaints(storage.getComplaints().filter(c => c.studentId === user.id));
    setAttendance(storage.getAttendance().filter(a => a.studentId === user.id && !a.isAnomaly));
  }, [user.id]);

  const attendancePercentage = useMemo(() => {
    const uniqueDays = new Set(attendance.map(a => new Date(a.timestamp).toDateString())).size;
    const targetDays = 30; // Monthly window
    return Math.min(100, Math.round((uniqueDays / targetDays) * 100));
  }, [attendance]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-1">
            Hostel {user.hostelBlock} • Room {user.roomNumber} • Roll: {user.id}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/student/attendance" className="bg-white border-2 border-slate-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center text-indigo-600">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Mark Presence
          </Link>
          <Link to="/student/complaint" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Report Issue
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
              <circle 
                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * attendancePercentage) / 100}
                className="text-indigo-600 transition-all duration-1000" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{attendancePercentage}%</span>
              <span className="text-[8px] font-black text-slate-400 uppercase">Monthly</span>
            </div>
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Attendance Status</h3>
          <button 
            onClick={() => setShowLogs(!showLogs)}
            className="mt-4 w-full text-[10px] font-black text-indigo-600 uppercase border-2 border-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            {showLogs ? 'Hide Analytics' : 'Check Attendance Details'}
          </button>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">My Active Issues</h3>
            <p className="text-4xl font-black mt-2 text-slate-900">{complaints.filter(c => c.status !== 'resolved').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Highest AI Priority</h3>
            <p className="text-4xl font-black mt-2 text-red-500">
              {complaints.length > 0 ? (Math.max(...complaints.map(c => c.priorityScore)) * 10).toFixed(1) : '0.0'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Resolved</h3>
            <p className="text-4xl font-black mt-2 text-emerald-500">{complaints.filter(c => c.status === 'resolved').length}</p>
          </div>
        </div>
      </section>

      {showLogs && (
        <section className="bg-indigo-900 text-white rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center">
            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2 animate-pulse"></span>
            Verified Attendance Log
          </h2>
          <div className="space-y-2">
            {attendance.length === 0 ? (
              <p className="text-sm font-bold opacity-50 italic">No attendance records found for this period.</p>
            ) : (
              attendance.slice(0, 5).map(a => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b border-indigo-800">
                  <span className="text-xs font-bold">{new Date(a.timestamp).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                  <span className="text-[10px] font-black uppercase bg-indigo-800 px-2 py-0.5 rounded">Verified via {a.ipAddress}</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">AI Priority History</h2>
          <div className="text-[10px] font-black text-slate-400 tracking-widest">LIVE SYNC ACTIVE</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Problem Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Score</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-bold italic">
                    You haven't reported any issues yet.
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-800 line-clamp-1">{c.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">REF ID: {c.id}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase border-2 ${CATEGORY_COLORS[c.category]}`}>
                        {CATEGORY_LABELS[c.category]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs font-black ${c.priorityScore > 0.7 ? 'text-red-600' : 'text-indigo-600'}`}>
                        {(c.priorityScore * 10).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase ${
                        c.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        c.status === 'escalated' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
