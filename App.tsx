
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentDashboard from './pages/StudentDashboard';
import ComplaintPage from './pages/ComplaintPage';
import AttendancePage from './pages/AttendancePage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import { User } from './types';

const SESSION_KEY = 'hostelsmart_user';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar user={currentUser} onLogout={handleLogout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Student Routes */}
            {currentUser.role === 'student' && (
              <>
                <Route path="/student" element={<StudentDashboard user={currentUser} />} />
                <Route path="/student/complaint" element={<ComplaintPage user={currentUser} />} />
                <Route path="/student/attendance" element={<AttendancePage user={currentUser} />} />
                <Route path="/" element={<Navigate to="/student" replace />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
              </>
            )}

            {/* Admin Routes */}
            {currentUser.role === 'admin' && (
              <>
                <Route path="/admin" element={<AdminDashboard user={currentUser} />} />
                <Route path="/admin/complaints" element={<AdminDashboard user={currentUser} />} />
                <Route path="/admin/attendance" element={<AdminDashboard user={currentUser} />} />
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            )}
          </Routes>
        </main>

        <div className="fixed bottom-4 right-4 z-50">
          <button 
            onClick={handleLogout}
            className="bg-white border-2 border-slate-100 shadow-xl px-4 py-2 rounded-full text-[10px] font-black text-slate-700 flex items-center hover:bg-slate-50 transition-all uppercase tracking-widest"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Exit System
          </button>
        </div>
      </div>
    </Router>
  );
};

export default App;
