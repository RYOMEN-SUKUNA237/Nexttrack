import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Package, Users, Settings as SettingsIcon,
  Bell, LogOut, Menu, X, Search, Loader2, UserCircle, Lock,
  MessageCircle, FileText, Star, Mail, Map as MapIcon,
  Globe, ChevronDown, ChevronRight, PawPrint
} from 'lucide-react';
import { AdminPage, Shipment, Handler } from './admin/types';
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
import ShipmentsPage from './admin/Shipments';
import CustomersPage from './admin/Customers';
import CouriersPage from './admin/Couriers';
import * as api from '../services/api';

/* ── Design tokens ───────────────────────────────────────────────────────── */
const N900 = '#0a1628';
const N800 = '#0f2040';
const ACCENT = '#4f8ef7';

/* ── Nav groups (branch structure) ──────────────────────────────────────── */
interface NavItem { id: AdminPage; label: string; icon: React.ReactNode; badge?: string; }
interface NavGroup { group: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Operations',
    items: [
      { id: 'overview',   label: 'Dashboard',      icon: <LayoutDashboard size={16} /> },
      { id: 'track-map',  label: 'Live Map',        icon: <MapIcon size={16} /> },
    ],
  },
  {
    group: 'Tracking Branches',
    items: [
      { id: 'shipments',  label: 'Parcels & Cargo',  icon: <Package size={16} />,  badge: 'Road' },
      { id: 'transports', label: 'Road Freight',      icon: <Truck size={16} /> },
      { id: 'pets',       label: 'Pet Transport',     icon: <PawPrint size={16} />, badge: 'Live' },
    ],
  },
  {
    group: 'People',
    items: [
      { id: 'handlers',   label: 'Handlers',         icon: <Users size={16} /> },
      { id: 'customers',  label: 'Customers',        icon: <UserCircle size={16} /> },
      { id: 'couriers',   label: 'Couriers',         icon: <Truck size={16} /> },
    ],
  },
  {
    group: 'Commercial',
    items: [
      { id: 'quotes',     label: 'Quotes',           icon: <FileText size={16} /> },
      { id: 'reviews',    label: 'Reviews',          icon: <Star size={16} /> },
    ],
  },
  {
    group: 'Communications',
    items: [
      { id: 'messages',   label: 'Messages',         icon: <MessageCircle size={16} /> },
      { id: 'emails',     label: 'Emails',           icon: <Mail size={16} /> },
    ],
  },
  {
    group: 'System',
    items: [
      { id: 'settings',   label: 'Settings',         icon: <SettingsIcon size={16} /> },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

/* ══════════════════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<AdminPage>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Shared data state for child pages that need props
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [couriers, setCouriers] = useState<Handler[]>([]);

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

  const refreshData = useCallback(async () => {
    try {
      const [shipRes, courierRes] = await Promise.all([
        api.shipments.list({ limit: '200' }),
        api.couriers.list({ limit: '200' }),
      ]);
      const raw: any[] = shipRes.shipments || [];
      setShipments(raw.map((s: any): Shipment => ({
        id: String(s.id),
        trackingId: s.tracking_id,
        petId: s.pet_id || null,
        senderName: s.sender_name || s.sender || '',
        senderEmail: s.sender_email || '',
        receiverName: s.receiver_name || s.receiver || '',
        receiverEmail: s.receiver_email || '',
        origin: s.origin || '',
        destination: s.destination || '',
        status: s.status,
        courierId: s.courier_id || null,
        transportType: (s.transport_type || 'road') as Shipment['transportType'],
        cargoType: s.cargo_type || '',
        weight: s.weight || '',
        isPaused: !!s.is_paused,
        pauseCategory: s.pause_category,
        pauseReason: s.pause_reason,
        estimatedDelivery: s.estimated_delivery || '',
        progress: s.progress ?? 0,
        createdAt: s.created_at || '',
        petName: s.pet_name,
        petSpecies: s.pet_species || s.species,
        petBreed: s.pet_breed || s.breed,
        petPhotoUrl: s.photo_url,
      })));
      const rawC: any[] = courierRes.couriers || [];
      setCouriers(rawC.map((c: any): Handler => ({
        id: String(c.id),
        courierId: c.courier_id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        vehicleType: c.vehicle_type || 'van',
        licensePlate: c.license_plate || '',
        zone: c.zone || '',
        status: c.status || 'active',
        totalDeliveries: c.total_deliveries ?? 0,
        rating: c.rating ?? 5.0,
        avatar: c.avatar || '',
        specialization: c.specialization || '',
        certifiedSpecies: c.certified_species || '',
        registeredAt: c.created_at?.split('T')[0] || '',
      })));
    } catch (err) {
      console.error('Failed to load shared data:', err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) refreshData();
  }, [isLoggedIn, refreshData]);

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

  const handleLogout = () => { localStorage.removeItem('pt_token'); setIsLoggedIn(false); setAdminUser(null); };
  const navigate = (page: string) => { setActivePage(page as AdminPage); setSidebarOpen(false); };
  const toggleGroup = (group: string) => setCollapsedGroups(p => ({ ...p, [group]: !p[group] }));

  const renderPage = () => {
    switch (activePage) {
      case 'overview':   return <Overview />;
      case 'pets':       return <Pets />;
      case 'handlers':   return <Handlers />;
      case 'transports': return <Transports />;
      case 'shipments':  return <ShipmentsPage shipments={shipments} setShipments={setShipments} couriers={couriers} onNavigate={navigate} onRefresh={refreshData} />;
      case 'customers':  return <CustomersPage onRefresh={refreshData} />;
      case 'couriers':   return <CouriersPage couriers={couriers} setCouriers={setCouriers} onRefresh={refreshData} />;
      case 'track-map':  return <TrackMap shipments={shipments} setShipments={setShipments} onRefresh={refreshData} />;
      case 'messages':   return <MessagesPage />;
      case 'quotes':     return <QuotesPage />;
      case 'reviews':    return <AdminReviewsPage />;
      case 'emails':     return <AdminEmailsPage />;
      case 'settings':   return <SettingsPage />;
      default:           return <Overview />;
    }
  };

  const initials = adminUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'NT';
  const currentLabel = ALL_NAV.find(n => n.id === activePage)?.label || 'Dashboard';

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: N900 }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading Next Track...</p>
      </div>
    </div>
  );

  /* ── Login Screen ── */
  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, #050d1a 0%, ${N900} 60%, ${N800} 100%)` }}>
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(79,142,247,0.06)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: N800, border: `1px solid rgba(79,142,247,0.2)` }}>
          <div className="px-8 py-10 text-center" style={{ background: `linear-gradient(135deg, ${N900}, #152b55)`, borderBottom: '1px solid rgba(79,142,247,0.2)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Next Track Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Global Logistics Management Portal</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="bg-red-900/30 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-800/50 space-y-1">
                <p>{loginError}</p>
                <p className="text-xs text-red-500/80">
                  Fallback admin: <span className="font-mono text-red-400">admin@nexttrack.io</span> / <span className="font-mono text-red-400">NextTrack2025!</span>
                </p>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email / Username</label>
              <div className="relative">
                <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={loginForm.username} required
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="admin@nexttrack.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none text-white placeholder-slate-500"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(79,142,247,0.25)' }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" value={loginForm.password} required
                  onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none text-white placeholder-slate-500"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(79,142,247,0.25)' }} />
              </div>
            </div>
            <button type="submit" disabled={loginLoading}
              className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>
              {loginLoading ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
              {loginLoading ? 'Signing in...' : 'Sign In to Next Track'}
            </button>
            <p className="text-center text-xs text-slate-500">Authorized personnel only · Next Track Global Logistics</p>
          </form>
        </div>
      </motion.div>
    </div>
  );

  /* ── Admin Shell ── */
  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 w-60 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: N900, borderRight: `1px solid rgba(79,142,247,0.1)` }}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(79,142,247,0.1)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">Next Track</span>
              <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: ACCENT }}>Admin</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.group} className="mb-1">
              <button onClick={() => toggleGroup(group.group)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest group"
                style={{ color: '#475569' }}>
                <span className="group-hover:text-slate-300 transition-colors">{group.group}</span>
                {collapsedGroups[group.group]
                  ? <ChevronRight size={11} className="text-slate-600" />
                  : <ChevronDown size={11} className="text-slate-600" />}
              </button>

              <AnimatePresence initial={false}>
                {!collapsedGroups[group.group] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden">
                    {group.items.map(item => (
                      <button key={item.id} onClick={() => navigate(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                          activePage === item.id
                            ? 'text-white nav-item-active'
                            : 'text-slate-400 hover:text-white nav-item-inactive'
                        }`}>
                        <span style={{ color: activePage === item.id ? ACCENT : '' }}>{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                        {item.badge && activePage !== item.id && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: 'rgba(79,142,247,0.15)', color: ACCENT }}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-2 border-t flex-shrink-0" style={{ borderColor: 'rgba(79,142,247,0.1)' }}>
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{adminUser?.full_name || 'Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate">{adminUser?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <LogOut size={14} /><span>Sign Out</span>
          </button>
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors mt-0.5">
            <span className="text-xs">←</span><span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-base font-bold" style={{ color: N900 }}>{currentLabel}</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Next Track · Global Logistics Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center relative">
                <Search size={14} className="absolute left-3 text-slate-400" />
                <input type="text" placeholder="Search..."
                  className="pl-9 pr-4 py-2 w-48 lg:w-56 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none" />
              </div>
              <button className="relative p-2 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>{initials}</div>
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