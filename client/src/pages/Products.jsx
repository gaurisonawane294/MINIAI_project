import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getProductsApi } from '../api/productApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import { Search, ShoppingCart, Check, AlertCircle, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Shoes'];

// Fallback products in case server is running without connected MongoDB
const STATIC_FALLBACK_PRODUCTS = [
  {
    _id: '651a20014d5e6f7a8b9c0001',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear wireless headphones with active noise cancellation and crystal clear audio fidelity.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Electronics' },
    stock: 25,
  },
  {
    _id: '651a20014d5e6f7a8b9c0002',
    name: 'Classic White Sneakers',
    description: 'Breathable cushioned athletic running shoes with lightweight grip and ergonomic sole support.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Shoes' },
    stock: 40,
  },
  {
    _id: '651a20014d5e6f7a8b9c0003',
    name: 'Minimalist Cotton T-Shirt',
    description: '100% organic combed cotton relaxed fit crewneck t-shirt with premium pre-shrunk stitching.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Fashion' },
    stock: 50,
  },
  {
    _id: '651a20014d5e6f7a8b9c0004',
    name: 'Smart Fitness Watch Series 5',
    description: 'Full touch AMOLED display with continuous heart rate sensor, sleep tracking, and 7-day battery life.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Electronics' },
    stock: 15,
  },
  {
    _id: '651a20014d5e6f7a8b9c0005',
    name: 'Trail Running Shoes Pro',
    description: 'High-traction outdoor trail runners designed for rugged terrains with shock absorption.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Shoes' },
    stock: 5,
  },
  {
    _id: '651a20014d5e6f7a8b9c0006',
    name: 'Leather Crossbody Messenger Bag',
    description: 'Handcrafted full-grain leather everyday messenger bag with brass buckles and dedicated tablet sleeve.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    category: { name: 'Fashion' },
    stock: 8,
  },
];

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [addedIds, setAddedIds] = useState({});

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await getProductsApi(params);
      if (res.success && res.products && res.products.length > 0) {
        setProducts(res.products);
      } else {
        // Fallback filter locally
        let filtered = STATIC_FALLBACK_PRODUCTS;
        if (selectedCategory !== 'All') {
          filtered = filtered.filter(
            (p) => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
          );
        }
        setProducts(filtered);
      }
    } catch (err) {
      console.warn('[Products] API fetch error, falling back to static catalog:', err.message);
      let filtered = STATIC_FALLBACK_PRODUCTS;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(
          (p) => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (product) => {
    const res = addToCart(product, 1);
    if (res.success) {
      showToast(res.message, res.isClamped ? 'info' : 'success');
      setAddedIds((prev) => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product._id]: false }));
      }, 1500);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our curated collections, filter by category, and add items to your cart.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">Loading catalog items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any products matching your current category or search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            const isJustAdded = addedIds[product._id];

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Image & Badge Overlay */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs">
                      {product.category?.name || 'Catalog'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-xs shadow-xs ${
                        isOutOfStock
                          ? 'bg-rose-500 text-white'
                          : isLowStock
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isOutOfStock
                        ? 'Out of Stock'
                        : isLowStock
                        ? `Only ${product.stock} left`
                        : `Stock: ${product.stock}`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Price</span>
                      <span className="text-lg font-black text-slate-900">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
