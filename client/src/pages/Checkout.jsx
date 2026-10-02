import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrderApi } from '../api/orderApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{7,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please provide a valid contact phone number';
    }
    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode / Postal code is required';
    } else if (!/^[0-9a-zA-Z-]{3,10}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Please enter a valid postal code';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast('Your cart is empty. Please add products before placing an order.', 'error');
      return;
    }

    if (!validate()) {
      showToast('Please correct the highlighted fields in the shipping form.', 'error');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const response = await createOrderApi(orderPayload);

      if (response.success) {
        clearCart();
        showToast('Order placed successfully! Redirecting to My Orders...', 'success');
        setTimeout(() => {
          navigate('/my-orders');
        }, 1200);
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
      showToast(serverMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-5">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500">
            You must have at least one product in your cart to proceed with checkout.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition"
          >
            Browse Catalog
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

      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-6 border-b border-slate-200">
        <Link
          to="/cart"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          title="Back to cart"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Checkout & Shipping
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete your delivery destination details to place your Cash on Delivery order.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Left Form, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping Address Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center space-x-2.5 pb-5 mb-6 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900">Delivery Address Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Recipient Full Name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                error={errors.name}
                required
              />

              <Input
                label="Contact Phone Number"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 555-019-2834"
                error={errors.phone}
                required
              />
            </div>

            <Input
              label="Street Address / Flat / Building"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Elm Street, Apartment 4B"
              error={errors.address}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Metropolis"
                error={errors.city}
                required
              />

              <Input
                label="Pincode / Postal Code"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 10001"
                error={errors.pincode}
                required
              />
            </div>

            {/* Payment Method Selector (Fixed COD) */}
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center space-x-2.5 pb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
              </div>

              <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full border-4 border-indigo-600 bg-white flex items-center justify-center"></div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</p>
                    <p className="text-xs text-slate-500">
                      Pay in cash upon doorstep package arrival. No advance online payment required.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  Zero Fee
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-base font-semibold shadow-lg shadow-indigo-100"
              >
                Place Order (${cartTotal.toFixed(2)})
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
            <span className="text-xs text-slate-500 font-medium">{totalItems} items</span>
          </div>

          {/* Line Items Snapshot */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between space-x-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="pt-4 border-t border-slate-200 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Processing</span>
              <span className="font-semibold text-slate-900">$0.00</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Grand Total</span>
              <span className="text-2xl font-black text-indigo-600">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Trust Server Authority</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Prices are calculated directly from MongoDB catalog documents upon submission,
              guaranteeing immunity against client-side price tampering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
