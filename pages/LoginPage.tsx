
import React, { useState } from 'react';
import { User } from '../types';
import { authenticateUser } from '../services/db';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authenticateUser(id, password, role);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check your ID and Password.');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tighter">HostelSmart AI</h1>
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mt-2">Verified Access Portal</p>
        </div>
        
        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => { setRole('student'); setError(''); }}
              className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-tight transition-all ${role === 'student' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Student
            </button>
            <button 
              onClick={() => { setRole('admin'); setError(''); }}
              className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-tight transition-all ${role === 'admin' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Warden
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                {role === 'student' ? 'Roll Number' : 'Employee ID'}
              </label>
              <input 
                required
                type="text" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all font-bold ${error ? 'border-red-200 bg-red-50' : 'border-slate-100 focus:border-indigo-500'}`}
                placeholder={role === 'student' ? 'e.g. STU101' : 'e.g. ADM001'}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all font-bold ${error ? 'border-red-200 bg-red-50' : 'border-slate-100 focus:border-indigo-500'}`}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 text-[11px] font-bold p-3 rounded-xl flex items-center animate-in fade-in slide-in-from-top-2">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying...
                </>
              ) : 'Login'}
            </button>
          </form>
          
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Demo Credentials: STU101 / ADM001 <br/> Password: pass123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
