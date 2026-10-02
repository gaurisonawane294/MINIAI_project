import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LayoutDashboard, Database, ShoppingBag, FolderTree, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboardPlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Guard Active: Protected Route</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Admin Management Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition"
        >
          View Storefront
        </Link>
      </div>

      {/* Admin Modules Placeholder Cards (Ready for Task 2 & Task 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories Module (Assigned to Collaborator 2 in Task 2) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Category Management</h3>
          <p className="text-xs text-slate-500">
            Assigned to Task 2: Create, edit, and delete store categories (Electronics, Fashion, Shoes).
          </p>
          <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
            Pending Task 2 Implementation
          </span>
        </div>

        {/* Products Module (Assigned to Collaborator 2 in Task 2) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Product Management</h3>
          <p className="text-xs text-slate-500">
            Assigned to Task 2: Add, update inventory stocks, configure prices, and upload image links.
          </p>
          <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
            Pending Task 2 Implementation
          </span>
        </div>

        {/* Orders Module (Task 4: Cart, Checkout & Order Processing) */}
        <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Orders Fulfillment</h3>
          <p className="text-xs text-slate-500">
            Task 4 Implemented: View customer orders, review Cash on Delivery shipments, and update lifecycle status.
          </p>
          <div className="pt-2 flex items-center justify-between">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
              ✓ Active
            </span>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 underline"
            >
              Open Orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPlaceholder;
