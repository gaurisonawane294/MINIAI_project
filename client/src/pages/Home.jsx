import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { checkAdminApi, getProfileApi } from '../api/authApi';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
  Package,
  Truck,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { totalItems, cartTotal } = useCart();
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
            <span>✨ Task 4 Completed</span>
            <span>•</span>
            <span>Cart, Checkout & Order Fulfillment Pipeline</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Mini E-Commerce Storefront
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Full-stack shopping cart with real-time stock clamping, zero-trust price calculations,
            Cash on Delivery checkout pipeline, atomic inventory reductions, and admin status fulfillment.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="px-5 py-2.5 bg-white text-indigo-900 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition shadow flex items-center space-x-2"
            >
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/cart"
              className="px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl border border-indigo-400/30 transition shadow flex items-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                View Cart {totalItems > 0 && `(${totalItems})`}
              </span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {user?.name} ({user?.role})
                </span>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2.5 text-xs text-indigo-200 hover:text-white font-medium transition"
              >
                Sign In →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Task 4 Interactive Feature Showcase */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Task 4 Feature Highlights</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Explore the end-to-end shopping journey from product catalog to order fulfillment.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            Task 4 Fully Integrated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Cart & Stock Clamping */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Cart & Stock Guard
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cart items persist in localStorage. Increment controls are bounded by real-time available inventory stock to prevent overselling.
              </p>
            </div>
            <Link
              to="/cart"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 pt-2"
            >
              <span>Open Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Zero-Trust Checkout */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Zero-Trust Pricing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Backend recalculates order totals strictly against MongoDB catalog prices, rejecting any client-side monetary tampering.
              </p>
            </div>
            <Link
              to="/checkout"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 pt-2"
            >
              <span>Go to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Customer Order History */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Order Tracking
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customers view immutable snapshots of purchased products, unit prices, Cash on Delivery totals, and shipping progress.
              </p>
            </div>
            <Link
              to="/my-orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 pt-2"
            >
              <span>View My Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Admin Fulfillment */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Admin Fulfillment
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Admins review all incoming customer orders and transition lifecycle status: Pending, Confirmed, Shipped, Delivered, Cancelled.
              </p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1 pt-2"
            >
              <span>Manage Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Task 1 Auth & Security Panel */}
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

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Customer Route Protection
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The <code className="text-indigo-600 font-mono text-[11px]">authMiddleware</code> guards customer endpoints. Unauthenticated requests receive 401 Unauthorized.
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

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Admin Role Authorization
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The <code className="text-indigo-600 font-mono text-[11px]">adminMiddleware</code> ensures only <code className="font-mono text-[11px]">role: 'admin'</code> can access admin controllers. Non-admins receive 403 Forbidden.
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

        {/* Navigation Links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <span>Customer Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <span>Admin Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/admin/orders"
            className="inline-flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <span>Admin Orders Fulfillment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
