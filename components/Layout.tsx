import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ArrowRight, ChevronUp, ChevronDown,
  Package, Globe, Truck, Ship, Plane, Activity,
  Shield, MapPin, BarChart2, Clock, Phone, Mail, Linkedin,
  Twitter, Facebook, Youtube
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps { children: React.ReactNode; }

/* ── Mega-nav structure ──────────────────────────────────────────────────── */
const megaMenus = {
  tracking: {
    label: 'Tracking Services',
    items: [
      { icon: <Package size={16} />, label: 'Parcel & Cargo', desc: 'Standard & express parcels', href: '#services' },
      { icon: <Truck size={16} />,   label: 'Road Freight',   desc: 'FTL, LTL & last-mile delivery', href: '#services' },
      { icon: <Plane size={16} />,   label: 'Air Freight',    desc: 'International air cargo', href: '#services' },
      { icon: <Ship size={16} />,    label: 'Sea Freight',    desc: 'Ocean containers & bulk', href: '#services' },
      { icon: <Activity size={16} />,label: 'Live Assets',    desc: 'IoT & fleet monitoring', href: '#services' },
      { icon: <MapPin size={16} />,  label: 'Pet Transport',  desc: 'Animal & livestock logistics', href: '#services' },
    ],
  },
  solutions: {
    label: 'Solutions',
    items: [
      { icon: <Globe size={16} />,     label: 'Global Logistics', desc: 'End-to-end supply chain', href: '#services' },
      { icon: <Shield size={16} />,    label: 'Customs & Compliance', desc: 'Documentation & brokerage', href: '#services' },
      { icon: <BarChart2 size={16} />, label: 'Analytics & Reports', desc: 'Real-time dashboards', href: '#services' },
      { icon: <Clock size={16} />,     label: 'SLA Management',   desc: 'Guaranteed delivery windows', href: '#services' },
    ],
  },
};

const navLinks = [
  { label: 'Home',    href: '#home' },
  { label: 'Track',   href: '#track' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'FAQ',     href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

/* ── Navy colour tokens ──────────────────────────────────────────────────── */
const N900 = '#0a1628';
const N800 = '#0f2040';
const N600 = '#1e3a6e';
const ACCENT = '#4f8ef7';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [activeMenu, setActiveMenu]   = useState<string | null>(null);
  const [scrolled, setScrolled]       = useState(false);
  const [showTop, setShowTop]         = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 20); setShowTop(window.scrollY > 600); };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (href: string) => {
    setActiveMenu(null); setMobileOpen(false);
    if (href.startsWith('/')) { navigate(href); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const id = href.replace('#', '');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:block text-xs py-2.5" style={{ background: N900, color: '#94a3b8' }}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone size={11} /> +1 800-NEXT-TRK</span>
            <span className="flex items-center gap-1.5"><Mail size={11} /> support@nexttrack.io</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              All Systems Operational
            </span>
            <span className="opacity-50">|</span>
            <span>24/7 Global Operations Center</span>
          </div>
        </div>
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-2xl' : ''}`}
        style={{ background: scrolled ? 'rgba(10,22,40,0.98)' : N900, borderBottom: `1px solid rgba(79,142,247,0.15)` }}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-18 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" onClick={() => go('#home')} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #4f8ef7, #1e3a6e)' }}>
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-xl font-bold tracking-tight text-white">Next </span>
              <span className="text-xl font-bold tracking-tight" style={{ color: ACCENT }}>Track</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#4f8ef7' }}>Global Logistics</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-1">
            {/* Home */}
            <a href="#home" onClick={(e) => { e.preventDefault(); go('#home'); }}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              Home
            </a>

            {/* Tracking Services mega */}
            <div className="relative" onMouseEnter={() => setActiveMenu('tracking')}>
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                Tracking Services <ChevronDown size={14} className={`transition-transform ${activeMenu === 'tracking' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeMenu === 'tracking' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 w-96 rounded-2xl shadow-2xl p-4 z-50"
                    style={{ background: N800, border: `1px solid rgba(79,142,247,0.2)` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: ACCENT }}>What We Track</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {megaMenus.tracking.items.map(item => (
                        <button key={item.label} onClick={() => go(item.href)}
                          className="flex items-start gap-3 p-2.5 rounded-xl text-left transition-all hover:bg-white/5 group">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0"
                            style={{ background: 'rgba(79,142,247,0.15)', color: ACCENT }}>
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions mega */}
            <div className="relative" onMouseEnter={() => setActiveMenu('solutions')}>
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                Solutions <ChevronDown size={14} className={`transition-transform ${activeMenu === 'solutions' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeMenu === 'solutions' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 w-80 rounded-2xl shadow-2xl p-4 z-50"
                    style={{ background: N800, border: `1px solid rgba(79,142,247,0.2)` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: ACCENT }}>Enterprise Solutions</p>
                    <div className="space-y-1">
                      {megaMenus.solutions.items.map(item => (
                        <button key={item.label} onClick={() => go(item.href)}
                          className="flex items-start gap-3 p-2.5 rounded-xl w-full text-left transition-all hover:bg-white/5 group">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0"
                            style={{ background: 'rgba(79,142,247,0.15)', color: ACCENT }}>
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.slice(2).map(link => (
              <a key={link.label} href={link.href} onClick={(e) => { e.preventDefault(); go(link.href); }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a href="#track" onClick={(e) => { e.preventDefault(); go('#track'); }}
              className="hidden lg:flex px-5 py-2.5 text-white text-sm font-semibold rounded-xl items-center gap-2 group transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2952a3, #4f8ef7)' }}>
              Track Shipment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }} className="xl:hidden overflow-hidden border-t"
              style={{ background: N800, borderColor: 'rgba(79,142,247,0.15)' }}>
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-0.5">
                <a href="#home" onClick={(e) => { e.preventDefault(); go('#home'); }} className="block px-4 py-3 text-sm font-medium text-slate-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors">Home</a>
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Tracking Services</p>
                {megaMenus.tracking.items.map(item => (
                  <button key={item.label} onClick={() => go(item.href)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors text-left">
                    <span style={{ color: ACCENT }}>{item.icon}</span> {item.label}
                  </button>
                ))}
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Solutions</p>
                {megaMenus.solutions.items.map(item => (
                  <button key={item.label} onClick={() => go(item.href)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors text-left">
                    <span style={{ color: ACCENT }}>{item.icon}</span> {item.label}
                  </button>
                ))}
                {navLinks.slice(2).map(link => (
                  <button key={link.label} onClick={() => go(link.href)} className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-200 hover:text-white rounded-xl hover:bg-white/5 transition-colors">{link.label}</button>
                ))}
                <div className="pt-3 border-t" style={{ borderColor: 'rgba(79,142,247,0.15)' }}>
                  <button onClick={() => go('#track')} className="w-full py-3 text-white text-sm font-semibold rounded-xl" style={{ background: 'linear-gradient(135deg, #2952a3, #4f8ef7)' }}>
                    Track Shipment
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main */}
      <main className="flex-grow">{children}</main>

      {/* Scroll to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-50 w-12 h-12 text-white rounded-full shadow-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2952a3, #4f8ef7)' }}>
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background: N900, color: '#e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f8ef7, #1e3a6e)' }}>
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">Next Track</span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>Global Logistics</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6 text-slate-400 max-w-xs">
                The world's most trusted multi-modal tracking platform. Parcels, freight, assets, and live animals — tracked with precision.
              </p>
              <div className="flex gap-3">
                {[Linkedin, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)' }}>
                    <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Tracking */}
            <div>
              <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest" style={{ color: ACCENT }}>Tracking</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {['Parcel & Cargo', 'Road Freight', 'Air Freight', 'Sea Freight', 'Live Assets', 'Pet Transport'].map(s => (
                  <li key={s}><a href="#services" onClick={e => { e.preventDefault(); go('#services'); }} className="hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest" style={{ color: ACCENT }}>Solutions</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {['Global Logistics', 'Customs & Compliance', 'Analytics', 'SLA Management', 'API Integration', 'Enterprise Plans'].map(s => (
                  <li key={s}><a href="#" className="hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest" style={{ color: ACCENT }}>Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {['About Us', 'Careers', 'Press', 'Partners', 'Blog', 'Contact'].map(s => (
                  <li key={s}><a href="#" className="hover:text-white transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Certifications row */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(79,142,247,0.12)' }}>
            <div className="flex flex-wrap gap-4 mb-6">
              {['ISO 9001:2015 Certified', 'IATA Member', 'CITES Compliant', 'USDA Certified', 'AEO Authorised Operator', 'GDPR Compliant'].map(c => (
                <span key={c} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'rgba(79,142,247,0.1)', color: '#93c5fd', border: '1px solid rgba(79,142,247,0.2)' }}>✓ {c}</span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Next Track Global Logistics. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;