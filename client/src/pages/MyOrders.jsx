import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../api/orderApi';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Package, Calendar, MapPin, Phone, User, ShoppingBag, ArrowRight } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyOrdersApi();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('[MyOrders] Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading your purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4">
          <p className="text-rose-600 font-semibold text-sm">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">No Orders Yet</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders yet. Discover our quality products and enjoy convenient Cash on Delivery checkout!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition duration-200"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your current shipments, review past order invoices, and monitor delivery progress.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition duration-200"
            >
              {/* Order Card Header */}
              <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Order ID</span>
                    <span className="font-mono font-bold text-slate-800">#{order._id}</span>
                  </div>
                  <div className="hidden sm:block text-slate-300">|</div>
                  <div>
                    <span className="text-slate-400 font-medium block">Date Placed</span>
                    <span className="font-semibold text-slate-700 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                  <div className="hidden sm:block text-slate-300">|</div>
                  <div>
                    <span className="text-slate-400 font-medium block">Payment Method</span>
                    <span className="font-semibold text-slate-700">
                      {order.paymentMethod || 'Cash on Delivery'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <StatusBadge status={order.status} />
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Total</span>
                    <span className="text-base sm:text-lg font-black text-indigo-600">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Card Body: Items & Destination */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Purchased Items List */}
                <div className="lg:col-span-8 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Purchased Items ({order.products?.length || 0})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {order.products?.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              Unit Price: ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Snapshot */}
                <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400">
                    Shipping Details
                  </h4>
                  <div className="space-y-1.5 text-slate-600">
                    <p className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.shippingAddress?.name}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.shippingAddress?.phone}</span>
                    </p>
                    <p className="flex items-start space-x-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {order.shippingAddress?.address}, {order.shippingAddress?.city} -{' '}
                        {order.shippingAddress?.pincode}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
