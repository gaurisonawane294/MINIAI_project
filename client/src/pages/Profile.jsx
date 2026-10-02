import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, KeyRound, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, token } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-indigo-200 text-sm">{user?.email}</p>
              <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3.5">
              <User className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Full Name</p>
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3.5">
              <Mail className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-slate-800">{user?.email}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3.5">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Assigned Role</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3.5">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Account Status</p>
                <p className="text-sm font-semibold text-emerald-600">Active & Verified</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active JWT Token (Client Session)</span>
            </h3>
            <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] break-all select-all">
              {token || 'No active token'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
