import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import Toast from '../components/common/Toast';

const Cart = () => {
  const { cartItems, totalItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleIncrement = (item) => {
    const currentQty = item.quantity || 1;
    const maxStock = typeof item.stock === 'number' ? item.stock : 999;

    if (currentQty >= maxStock) {
      showToast(
        `Cannot add more units. Only ${maxStock} in stock for "${item.name}".`,
        'error'
      );
      return;
    }

    const res = updateQuantity(item._id, currentQty + 1);
    if (!res.success && res.message) {
      showToast(res.message, 'error');
    }
  };

  const handleDecrement = (item) => {
    const currentQty = item.quantity || 1;
    if (currentQty > 1) {
      updateQuantity(item._id, currentQty - 1);
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item._id);
    showToast(`Removed "${item.name}" from your cart.`, 'info');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Looks like you haven't added any items to your shopping cart yet. Explore our latest collection and find what you love!
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition duration-200"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your selected items and quantities before proceeding to checkout.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in Cart
          </span>
          <button
            onClick={clearCart}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Grid: Cart Items on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table / List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {cartItems.map((item) => {
              const itemSubtotal = Math.round(item.price * item.quantity * 100) / 100;
              const isAtMaxStock = item.quantity >= (item.stock || 999);
              const isAtMinStock = item.quantity <= 1;

              return (
                <div
                  key={item._id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-slate-50/50 transition"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-600">
                        ${Number(item.price).toFixed(2)} each
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            item.stock <= 5
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Controls, Subtotal, Remove */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Quantity Selector with Stock Clamping */}
                    <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={isAtMinStock}
                        title={isAtMinStock ? 'Minimum 1 unit' : 'Decrease quantity'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                          isAtMinStock
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-white hover:shadow-xs active:scale-95'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleIncrement(item)}
                        disabled={isAtMaxStock}
                        title={
                          isAtMaxStock
                            ? `Max stock limit (${item.stock}) reached`
                            : 'Increase quantity'
                        }
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                          isAtMaxStock
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-white hover:shadow-xs active:scale-95'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-xs text-slate-400 font-medium">Subtotal</p>
                      <p className="text-base font-bold text-slate-900">
                        ${itemSubtotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => handleRemove(item)}
                      title="Remove item"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              to="/products"
              className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
            >
              <span>← Continue Shopping</span>
            </Link>
            <span>Prices verified strictly from database at checkout</span>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({totalItems})</span>
              <span className="font-semibold text-slate-900">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Method</span>
              <span className="font-medium text-slate-700">Cash on Delivery</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total Amount</span>
              <span className="text-2xl font-black text-indigo-600">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              Stock is guaranteed and verified in real-time before order finalization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
