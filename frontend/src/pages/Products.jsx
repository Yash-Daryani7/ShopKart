import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Package, AlertCircle, Loader2, PackageX, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService, wishlistService } from '../services/api';

const Products = ({ user }) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  // Wishlist IDs — fetched once so ProductCard knows which items are already saved
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  // Categories list
  const categories = ['Electronics', 'Fashion', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Food'];

  // Fetch wishlist IDs once when the page loads (only when logged in)
  useEffect(() => {
    if (!user) return;
    wishlistService.getAll()
      .then((data) => {
        const ids = new Set((data.wishlist || []).map((p) => p._id));
        setWishlistedIds(ids);
      })
      .catch(() => {
        // Non-critical — wishlist state will just default to "not saved"
      });
  }, [user]);

  // Callback to add/remove an id from the local wishlistedIds set
  // so toggling on a card stays in sync without a full refetch
  const onWishlistChange = useCallback((productId, isSaved) => {
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const data = await productService.getAll(params);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Debounced fetch when search/category/sort changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Product Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Browse and discover amazing products
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white text-sm text-slate-900 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 bg-white text-sm text-slate-900 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Sort By</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || category || sort) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active:</span>
            {search && (
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 flex items-center gap-1">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="ml-0.5 hover:text-blue-900 cursor-pointer">×</button>
              </span>
            )}
            {category && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100 flex items-center gap-1">
                {category}
                <button onClick={() => setCategory('')} className="ml-0.5 hover:text-indigo-900 cursor-pointer">×</button>
              </span>
            )}
            {sort && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100 flex items-center gap-1">
                {sort === 'price_asc' ? 'Price ↑' : 'Price ↓'}
                <button onClick={() => setSort('')} className="ml-0.5 hover:text-amber-900 cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setCategory(''); setSort(''); }}
              className="text-xs text-red-600 hover:text-red-700 font-medium underline underline-offset-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-base font-bold text-slate-900 mb-1">Something went wrong</p>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <PackageX className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-900 mb-1">No products found</p>
          <p className="text-sm text-slate-500">
            {search || category
              ? 'Try adjusting your search or filters.'
              : 'Products will appear here once they are added.'}
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{products.length}</span> product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                user={user}
                initialWishlisted={wishlistedIds.has(product._id)}
                onWishlistChange={onWishlistChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
