import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, Package, Heart, ShoppingCart, ClipboardList } from 'lucide-react';
import { customerService } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalQuantity } = useCart();

  const handleLogout = async () => {
    try {
      await customerService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  const navClass = (active, accent = 'green') => {
    const activeClasses = {
      green: 'bg-[#e8eee6] text-[#294839]',
      rose: 'bg-rose-50 text-rose-700',
      amber: 'bg-amber-50 text-amber-800',
    };
    return `nav-link ${active ? activeClasses[accent] : 'text-slate-600 hover:bg-[#f4f3ed] hover:text-[#294839]'}`;
  };

  return (
    <header className="store-nav sticky top-0 z-50">
      <div className="store-nav-inner">
        <Link to="/home" className="store-brand" aria-label="ShopKart home">
          <span className="store-brand-mark"><ShoppingBag className="w-5 h-5" /></span>
          <span className="store-brand-copy">
            <span className="store-brand-name">ShopKart</span>
            <span className="store-brand-tagline">A little joy, delivered</span>
          </span>
        </Link>

        <nav className="store-navigation" aria-label="Main navigation">
          {user ? (
            <>
              <Link to="/products" className={navClass(location.pathname.startsWith('/products'))}>
                <Package className="w-4 h-4" /><span>Discover</span>
              </Link>
              <Link to="/wishlist" className={navClass(location.pathname === '/wishlist', 'rose')}>
                <Heart className="w-4 h-4" /><span>Saved</span>
              </Link>
              <Link to="/cart" className={navClass(location.pathname === '/cart', 'amber')}>
                <span className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {totalQuantity > 0 && (
                    <span className="cart-count">{totalQuantity > 9 ? '9+' : totalQuantity}</span>
                  )}
                </span>
                <span>Bag{totalQuantity > 0 ? ` (${totalQuantity})` : ''}</span>
              </Link>
              <Link to="/orders" className={navClass(location.pathname.startsWith('/orders'))}>
                <ClipboardList className="w-4 h-4" /><span>Orders</span>
              </Link>
              <span className="nav-user" title={user.fullName}>
                <span className="nav-user-avatar">{user.fullName?.charAt(0).toUpperCase()}</span>
                <span className="nav-user-name">{user.fullName}</span>
              </span>
              <button onClick={handleLogout} className="nav-logout" title="Logout" aria-label="Logout">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-auth-link ${location.pathname === '/login' ? 'nav-auth-active' : ''}`}
              >
                Log in
              </Link>
              <Link to="/register" className="nav-join-link">Join ShopKart</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
