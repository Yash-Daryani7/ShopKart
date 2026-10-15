import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { customerService } from './services/api';
import { useCart } from './context/CartContext';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const { fetchCart } = useCart();

  // Attempt to restore user session on initial app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const profile = await customerService.getMe();
        setUser(profile);
        // Once we know the user is authenticated, pre-load their cart into global state
        fetchCart();
      } catch (err) {
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Initializing ShopKart...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-shell min-h-screen bg-[#f7f6f1] flex flex-col font-sans">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/home" element={<Home user={user} setUser={setUser} />} />
            <Route path="/products" element={<Products user={user} />} />
            <Route path="/products/:id" element={<ProductDetails user={user} />} />
            {/* Lab 04 — Wishlist */}
            <Route path="/wishlist" element={<Wishlist user={user} />} />
            {/* Lab 05 — Cart */}
            <Route path="/cart" element={<Cart user={user} />} />
            {/* Lab 06 — Checkout & Orders */}
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/order-success/:id" element={<OrderSuccess user={user} />} />
            <Route path="/orders" element={<Orders user={user} />} />
            <Route path="/orders/:id" element={<OrderDetails user={user} />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
