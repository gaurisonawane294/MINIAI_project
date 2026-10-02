import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import { ShieldCheck, Package, Calendar, Phone, ArrowLeft, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersApi();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('[AdminOrders] Fetch error:', err);
      showToast(err.response?.data?.message || 'Failed to fetch customer orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await updateOrderStatusApi(orderId, newStatus);
      if (response.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
        showToast(`Order #${orderId.slice(-6)} updated to "${newStatus}"`, 'success');
      }
    } catch (err) {
      console.error('[AdminOrders] Status update error:', err);
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filterStatus === 'All'
      ? orders
      : orders.filter((o) => o.status?.toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/admin" className="hover:text-indigo-600 transition">
              Admin Panel
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Orders Fulfillment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Customer Orders Management</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
              Admin Only
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage live orders, verify Cash on Delivery transactions, and update shipping progress.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Refresh order list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {['All', ...STATUS_OPTIONS].map((status) => {
          const isActive = filterStatus === status;
          const count =
            status === 'All'
              ? orders.length
              : orders.filter((o) => o.status === status).length;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{status}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-xs font-medium text-slate-500">Fetching all customer orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400">
              {filterStatus === 'All'
                ? 'No customers have placed orders yet.'
                : `No orders currently in "${filterStatus}" status.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer & Phone</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 sm:px-6">Status Selector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isUpdating = updatingId === order._id;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Order ID & Date */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          #{order._id}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </span>
                      </td>

                      {/* Customer & Phone */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 leading-tight">
                          {order.shippingAddress?.name || order.user?.name || 'Customer'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {order.user?.email || 'N/A'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.shippingAddress?.phone}</span>
                        </p>
                      </td>

                      {/* Items Summary */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-[200px]">
                          {order.products?.map((item, idx) => (
                            <p
                              key={idx}
                              className="text-xs text-slate-700 truncate"
                              title={`${item.name} (${item.quantity}x)`}
                            >
                              <strong className="text-slate-900">{item.quantity}x</strong>{' '}
                              {item.name}
                            </p>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          ${Number(order.totalAmount).toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4">
                        <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-2">
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <LoadingSpinner size="sm" />
                          )}
                        </div>
                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
