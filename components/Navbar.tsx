
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isAdmin = user.role === 'admin';

  const navLinks = isAdmin 
    ? [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/complaints', label: 'Complaints Queue' },
        { path: '/admin/attendance', label: 'Attendance Monitor' },
      ]
    : [
        { path: '/student', label: 'Home' },
        { path: '/student/complaint', label: 'New Complaint' },
        { path: '/student/attendance', label: 'Mark Attendance' },
      ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to={isAdmin ? '/admin' : '/student'} className="flex items-center">
              <span className="text-xl font-bold text-indigo-600 tracking-tight">HostelSmart</span>
              <span className="ml-2 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 uppercase">AI Core</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
              <span className="text-[10px] text-slate-500 uppercase font-medium">{user.role} • {user.hostelBlock}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
