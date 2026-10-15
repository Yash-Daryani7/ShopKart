import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  KeyRound,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { customerService } from '../services/api';

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password Change Modal / Form State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ success: '', error: '' });

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await customerService.getMe();
        if (isMounted) {
          setUser(profile);
          setError('');
        }
      } catch (err) {
        console.error('Failed to fetch profile (unauthenticated):', err);
        if (isMounted) {
          setUser(null);
          // If not logged in, automatically redirect to /login (Task 3 requirement)
          navigate('/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ success: '', error: '' });

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordStatus({ success: '', error: 'Please fill in both password fields' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ success: '', error: 'New password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await customerService.changePassword(passwordData);
      setPasswordStatus({ success: res.message || 'Password changed successfully!', error: '' });
      setPasswordData({ oldPassword: '', newPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus({ success: '', error: '' });
      }, 2000);
    } catch (err) {
      setPasswordStatus({
        success: '',
        error: err.response?.data?.message || 'Failed to update password',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Welcome Banner */}
      <div className="home-hero p-6 sm:p-10 mb-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="home-hero-content">
          <div className="home-hero-kicker inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Customer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user.fullName}!
          </h1>
          <p className="home-hero-copy mt-2 text-base sm:text-lg font-normal">
            You are successfully authenticated. Explore your ShopKart customer profile, manage your account settings, and browse exclusive offers.
          </p>
          <Link to="/products" className="home-hero-action">
            <ShoppingBag className="w-4 h-4" />
            Explore the collection
          </Link>
        </div>
      </div>

      {/* Grid Layout for Profile & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Profile
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            {/* Profile Avatar & Details */}
            <div className="py-6 flex flex-col items-center text-center border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20 mb-3">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{user.fullName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user._id}</p>
            </div>

            {/* Customer Information List */}
            <div className="py-5 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-600 font-medium">Email Address</p>
                  <p className="font-semibold text-slate-900 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Phone Number</p>
                  <p className="font-semibold text-slate-900">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Authentication</p>
                  <p className="font-semibold text-slate-900">JWT + HttpOnly Cookie</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: ShopKart Overview & Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Cart Items</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">Orders</p>
                <p className="text-2xl font-bold text-slate-900">0</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase">ShopKart Balance</p>
                <p className="text-2xl font-bold text-slate-900">$0.00</p>
              </div>
            </div>
          </div>

          {/* ShopKart Security & Authentication Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Security Architecture Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="font-semibold text-slate-900 mb-1">HttpOnly Cookie Security</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Your JWT token is stored inside an HttpOnly cookie, preventing malicious XSS scripts from accessing session tokens.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="font-semibold text-slate-900 mb-1">Bcrypt Hash Protection</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Passwords are never stored in plaintext. They are salted and hashed with bcrypt before touching MongoDB.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="font-semibold text-slate-900 mb-1">Protected Route Verification</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Every request to <code className="text-xs bg-slate-200 px-1 py-0.5 rounded font-mono">/customers/me</code> verifies the JWT signature on the Express backend before granting access.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <p className="font-semibold text-slate-900 mb-1">Safe Customer Data</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Password hashes are explicitly excluded (<code className="text-xs bg-slate-200 px-1 py-0.5 rounded font-mono">-password</code>) from all profile responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Change Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your current password and choose a new secure password (min 6 characters).
            </p>

            {passwordStatus.error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
