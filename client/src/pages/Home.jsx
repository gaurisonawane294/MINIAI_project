import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkAdminApi, getProfileApi } from '../api/authApi';
import { ShieldCheck, UserCheck, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [apiResponse, setApiResponse] = useState(null);
  const [testing, setTesting] = useState(false);

  const testCustomerApi = async () => {
    setTesting(true);
    setApiResponse(null);
    try {
      const data = await getProfileApi();
      setApiResponse({ success: true, endpoint: '/api/auth/me', data });
    } catch (err) {
      setApiResponse({
        success: false,
        endpoint: '/api/auth/me',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const testAdminApi = async () => {
    setTesting(true);
    setApiResponse(null);
    try {
      const data = await checkAdminApi();
      setApiResponse({ success: true, endpoint: '/api/auth/admin-check', data });
    } catch (err) {
      setApiResponse({
        success: false,
        endpoint: '/api/auth/admin-check',
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold">
            <span>✨ Task 1 Completed</span>
            <span>•</span>
            <span>MERN Authentication & Route Protection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Mini E-Commerce Storefront
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Full-stack authentication system powered by JWT, bcrypt salted password hashing,
            role-based Express middleware guards, and persistent React Context.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-medium">
                  Logged in as <strong className="text-white">{user?.name}</strong> ({user?.role})
                </span>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-white text-indigo-900 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition shadow"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl border border-indigo-400/30 transition shadow"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Task 1 Interactive Verification Dashboard */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Authentication & Security Verification Panel
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Verify JWT generation, token headers, role guards, and API middleware live.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isAuthenticated
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isAuthenticated ? `Authenticated (${user?.role})` : 'Guest Session'}
          </span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: JWT & Password Security */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Password & JWT Security
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Passwords securely hashed with bcrypt (salt rounds: 10). JWT tokens signed with
              7-day expiration and verified on protected endpoints.
            </p>
          </div>

          {/* Card 2: Customer Protection */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Customer Route Protection
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The <code className="text-indigo-600 font-mono text-[11px]">authMiddleware</code>{' '}
              guards customer endpoints. Unauthenticated requests receive 401 Unauthorized.
            </p>
            <Button
              variant="outline"
              size="sm"
              loading={testing}
              onClick={testCustomerApi}
              className="w-full text-xs"
            >
              Test Customer API (/api/auth/me)
            </Button>
          </div>

          {/* Card 3: Admin Role Protection */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Admin Role Authorization
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The <code className="text-indigo-600 font-mono text-[11px]">adminMiddleware</code>{' '}
              ensures only <code className="font-mono text-[11px]">role: 'admin'</code> can access
              admin controllers. Non-admins receive 403 Forbidden.
            </p>
            <Button
              variant="outline"
              size="sm"
              loading={testing}
              onClick={testAdminApi}
              className="w-full text-xs"
            >
              Test Admin API (/api/auth/admin-check)
            </Button>
          </div>
        </div>

        {/* Live API Tester Result Console */}
        {apiResponse && (
          <div className="p-4 rounded-xl border bg-slate-900 text-slate-100 text-xs font-mono mb-6 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-indigo-400 font-semibold">
                Response for: {apiResponse.endpoint}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] ${
                  apiResponse.success
                    ? 'bg-emerald-900/60 text-emerald-300'
                    : 'bg-rose-900/60 text-rose-300'
                }`}
              >
                {apiResponse.success ? '200 OK' : 'FAILED / FORBIDDEN'}
              </span>
            </div>
            <pre className="overflow-x-auto p-2">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Protected Navigation Links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <span>Visit Protected Customer Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <span>Visit Protected Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
