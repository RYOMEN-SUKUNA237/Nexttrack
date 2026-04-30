import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Truck, PawPrint, Users, Settings as SettingsIcon,
  Bell, LogOut, Menu, X, Search, Loader2, UserCircle, Lock,
  MessageCircle, FileText, Star, Mail, Map as MapIcon, Heart
} from 'lucide-react';
import { AdminPage } from './admin/types';
import Overview from './admin/Overview';
import Pets from './admin/Pets';
import Handlers from './admin/Handlers';
import Transports from './admin/Transports';
import TrackMap from './admin/TrackMap';
import MessagesPage from './admin/Messages';
import QuotesPage from './admin/Quotes';
import AdminReviewsPage from './admin/Reviews';
import AdminEmailsPage from './admin/Emails';
import SettingsPage from './admin/Settings';
import * as api from '../services/api';

const NAV: { id: AdminPage; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'overview',   label: 'Dashboard',   icon: <LayoutDashboard size={18} /> },
  { id: 'pets',       label: 'Pets',         icon: <PawPrint size={18} />,  badge: 'Core' },
  { id: 'handlers',   label: 'Handlers',     icon: <Users size={18} /> },
  { id: 'transports', label: 'Transports',   icon: <Truck size={18} /> },
  { id: 'track-map',  label: 'Live Map',     icon: <MapIcon size={18} /> },
  { id: 'messages',   label: 'Messages',     icon: <MessageCircle size={18} /> },
  { id: 'quotes',     label: 'Quotes',       icon: <FileText size={18} /> },
  { id: 'reviews',    label: 'Reviews',      icon: <Star size={18} /> },
  { id: 'emails',     label: 'Emails',       icon: <Mail size={18} /> },
  { id: 'settings',   label: 'Settings',     icon: <SettingsIcon size={18} /> },
];

const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<AdminPage>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('pt_token');
    if (token) {
      api.getMe()
        .then((d: any) => { setAdminUser(d.user); setIsLoggedIn(true); })
        .catch(() => localStorage.removeItem('pt_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); setLoginLoading(true);
    try {
      const d: any = await api.login(loginForm.username, loginForm.password);
      localStorage.setItem('pt_token', d.token);
      setAdminUser(d.user); setIsLoggedIn(true);
    } catch (err: any) { setLoginError(err.message || 'Login failed.'); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('pt_token');
    setIsLoggedIn(false); setAdminUser(null);
  };

  const navigate = (page: string) => { setActivePage(page as AdminPage); setSidebarOpen(false); };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':   return <Overview />;
      case 'pets':       return <Pets />;
      case 'handlers':   return <Handlers />;
      case 'transports': return <Transports />;
      case 'track-map':  return <TrackMap shipments={[]} setShipments={() => {}} onRefresh={() => {}} />;
      case 'messages':   return <MessagesPage />;
      case 'quotes':     return <QuotesPage />;
      case 'reviews':    return <AdminReviewsPage />;
      case 'emails':     return <AdminEmailsPage />;
      case 'settings':   return <SettingsPage />;
      default:           return <Overview />;
    }
  };

  const initials = adminUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'PW';
  const currentLabel = NAV.find(n => n.id === activePage)?.label || 'Dashboard';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8F0' }}>
      <div className="text-center">
        <PawPrint className="w-10 h-10 mx-auto animate-bounce mb-3" style={{ color: '#F59E0B' }} />
        <p className="text-sm text-gray-400">Loading Next Track...</p>
      </div>
    </div>
  );

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#0D4B4D 0%,#0a3335 60%,#1a1a2e 100%)' }}>
      {/* Paw prints decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-10">
        {['10%,15%','80%,10%','20%,70%','75%,80%','50%,40%'].map((pos, i) => (
          <span key={i} className="absolute text-6xl" style={{ left: pos.split(',')[0], top: pos.split(',')[1] }}>🐾</span>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10">
        {/* Header */}
        <div className="px-8 py-10 text-center" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <PawPrint className="w-8 h-8" style={{ color: '#F59E0B' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">Next Track Admin</h1>
          <p className="text-amber-100 text-sm mt-1">Pet Transport Management Portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {loginError && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">{loginError}</div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email / Username</label>
            <div className="relative">
              <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={loginForm.username} required
                onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                placeholder="admin@nexttrace.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={loginForm.password} required
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loginLoading}
            className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
            {loginLoading ? <Loader2 size={18} className="animate-spin" /> : <PawPrint size={18} />}
            {loginLoading ? 'Signing in...' : 'Sign In to Next Track'}
          </button>
          <p className="text-center text-xs text-gray-400">Authorized personnel only.</p>
        </form>
      </motion.div>
    </div>
  );

  // ── Admin Shell ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: '#FFF8F0' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'linear-gradient(180deg,#0D4B4D 0%,#0a3335 100%)' }}>
        {/* Logo */}
        <div className="h-18 flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight">Next Track</span>
              <p className="text-teal-400 text-xs leading-tight">Admin Portal</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activePage === item.id
                  ? 'text-white shadow-md'
                  : 'text-teal-200 hover:bg-white/10 hover:text-white'
              }`}
              style={activePage === item.id ? { background: 'linear-gradient(135deg,#F59E0B,#D97706)' } : {}}>
              {item.icon}
              <span>{item.label}</span>
              {item.badge && activePage !== item.id && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-semibold">{item.badge}</span>
              )}
              {activePage === item.id && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{adminUser?.full_name || 'Admin'}</p>
              <p className="text-xs text-teal-400 truncate">{adminUser?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-teal-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <LogOut size={15} /><span>Sign Out</span>
          </button>
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm text-teal-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors mt-0.5">
            <span className="text-sm">←</span><span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-amber-100 px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-amber-50 rounded-xl transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#0D4B4D' }}>{currentLabel}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Next Track Pet Transport Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center relative">
                <Search size={14} className="absolute left-3 text-gray-400" />
                <input type="text" placeholder="Search..."
                  className="pl-9 pr-4 py-2 w-48 lg:w-56 bg-amber-50 border border-amber-200 rounded-xl text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none" />
              </div>
              <button className="relative p-2 bg-amber-50 rounded-xl text-gray-500 hover:bg-amber-100 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>{initials}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activePage}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;