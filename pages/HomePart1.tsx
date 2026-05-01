import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import Reveal from '../components/ui/Reveal';
import {
  Search, ArrowRight, Package, Truck, Plane, Ship,
  Activity, MapPin, Globe, Shield, CheckCircle,
  BarChart2, Clock, Users, Zap, Lock
} from 'lucide-react';

/* ── Colour tokens ───────────────────────────────────────────────────────── */
const N900 = '#0a1628';
const N800 = '#0f2040';
const N700 = '#152b55';
const N600 = '#1e3a6e';
const ACCENT = '#4f8ef7';

/* ═══════════════════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════════════════ */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');
  const handleTrack = () => { if (trackId.trim()) navigate(`/track/${trackId.trim()}`); };

  const stats = [
    { n: '2.4M+', l: 'Shipments Tracked' },
    { n: '98.7%', l: 'On-Time Delivery' },
    { n: '190+',  l: 'Countries Covered' },
    { n: '24/7',  l: 'Live Operations' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden" style={{ background: N900 }}>
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?fm=jpg&fit=crop&w=2000&q=80"
          alt="Global logistics hub"
          className="w-full h-full object-cover opacity-20"
        />
        {/* Professional grid overlay — NO paw prints */}
        <div className="absolute inset-0 grid-pattern opacity-100" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${N900} 0%, rgba(10,22,40,0.9) 60%, rgba(21,43,85,0.7) 100%)` }} />
        {/* Accent glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(79,142,247,0.08)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(41,82,163,0.1)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left content */}
          <Reveal direction="left" delay={0.1} width="100%">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd', border: '1px solid rgba(79,142,247,0.3)' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Trusted by 15,000+ Businesses Globally
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight">
                Track Anything.{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${ACCENT}, #a78bfa)` }}>
                  Anywhere.
                </span>
                <br />Anytime.
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                Next Track is a unified logistics intelligence platform — covering parcels, road freight, air cargo, sea shipments, live assets, and specialized pet transport in one powerful dashboard.
              </p>

              {/* Quick Track Bar */}
              <form onSubmit={e => { e.preventDefault(); handleTrack(); }} className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" value={trackId} onChange={e => setTrackId(e.target.value)}
                    placeholder="Enter tracking ID (e.g. NT-8842-X9)"
                    className="w-full h-14 pl-12 pr-4 rounded-xl text-sm font-mono outline-none text-white placeholder-slate-500"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(79,142,247,0.35)', backdropFilter: 'blur(8px)' }}
                  />
                </div>
                <button type="submit" className="h-14 px-7 rounded-xl font-semibold text-white whitespace-nowrap shadow-lg transition-all hover:scale-105 hover:shadow-blue-500/30"
                  style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>
                  Track Now
                </button>
              </form>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: 'rgba(79,142,247,0.15)' }}>
                {stats.map(({ n, l }) => (
                  <div key={l}>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{n}</p>
                    <p className="text-xs text-slate-500 leading-tight mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right — floating info cards */}
          <Reveal direction="right" delay={0.4} className="hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="rounded-2xl p-6 shadow-2xl"
                style={{ background: 'rgba(15,32,64,0.9)', border: '1px solid rgba(79,142,247,0.2)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Active Shipments</p>
                    <p className="text-3xl font-bold text-white mt-0.5">1,482</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </div>
                </div>
                {/* Mini shipment rows */}
                {[
                  { id: 'NT-4821', type: 'Air Freight', from: 'Dubai', to: 'London', pct: 78, color: '#4f8ef7' },
                  { id: 'NT-3309', type: 'Sea Cargo',   from: 'Shanghai', to: 'LA', pct: 45, color: '#a78bfa' },
                  { id: 'NT-7701', type: 'Road Freight', from: 'Berlin', to: 'Paris', pct: 92, color: '#34d399' },
                  { id: 'NT-5512', type: 'Pet Transport', from: 'NYC', to: 'Miami', pct: 60, color: '#fb923c' },
                ].map(s => (
                  <div key={s.id} className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white">{s.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full text-slate-300" style={{ background: 'rgba(255,255,255,0.07)' }}>{s.type}</span>
                      </div>
                      <span className="text-xs text-slate-400">{s.from} → {s.to}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl shadow-2xl"
                style={{ background: N700, border: `1px solid rgba(79,142,247,0.25)` }}>
                <p className="text-xs font-semibold text-white">190+ Countries</p>
                <p className="text-[10px] text-slate-400">Worldwide Coverage</p>
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2"
                style={{ background: N700, border: `1px solid rgba(79,142,247,0.25)` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#34d399' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">NT-8842-X9 Delivered</p>
                  <p className="text-[10px] text-slate-400">2 min ago · Verified</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: `linear-gradient(to top, #f8fafc, transparent)` }} />
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TRACKING CATEGORIES — Branch system
═══════════════════════════════════════════════════════════════════════════ */
const trackingBranches = [
  {
    category: 'Parcel & Cargo',
    icon: <Package className="w-6 h-6" />,
    color: '#4f8ef7',
    bg: 'rgba(79,142,247,0.1)',
    description: 'Real-time tracking for all parcel sizes and cargo types.',
    services: ['Express Parcels', 'Bulk Cargo', 'Fragile Items', 'Cold Chain', 'Document Courier', 'Oversized Freight'],
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?fm=jpg&fit=crop&w=600&q=80',
    stats: '850K+ parcels/month',
  },
  {
    category: 'Road Freight',
    icon: <Truck className="w-6 h-6" />,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    description: 'Full-truckload, LTL, and last-mile delivery tracking across all routes.',
    services: ['FTL', 'LTL', 'Last-Mile', 'Refrigerated', 'Flatbed', 'Hazmat'],
    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?fm=jpg&fit=crop&w=600&q=80',
    stats: '320K+ active routes',
  },
  {
    category: 'Air Freight',
    icon: <Plane className="w-6 h-6" />,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    description: 'Global air cargo tracking from pickup to customs clearance to delivery.',
    services: ['Priority Air', 'Standard Air', 'Dangerous Goods', 'Pharma Air', 'Perishables', 'Charter'],
    img: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?fm=jpg&fit=crop&w=600&q=80',
    stats: '190+ destinations',
  },
  {
    category: 'Sea Freight',
    icon: <Ship className="w-6 h-6" />,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    description: 'Container, bulk, and RORO ocean freight with live vessel tracking.',
    services: ['FCL', 'LCL', 'Bulk Carrier', 'RORO', 'Tankers', 'Reefer Containers'],
    img: 'https://images.unsplash.com/photo-1524522173746-f628baad3644?fm=jpg&fit=crop&w=600&q=80',
    stats: '500+ ports connected',
  },
  {
    category: 'Live Asset Tracking',
    icon: <Activity className="w-6 h-6" />,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.1)',
    description: 'IoT-powered real-time tracking for fleets, equipment, and high-value assets.',
    services: ['Fleet Management', 'IoT Sensors', 'Cold-Chain Monitoring', 'Equipment Rental', 'Construction Assets', 'Generator Tracking'],
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?fm=jpg&fit=crop&w=600&q=80',
    stats: '45K+ tracked assets',
  },
  {
    category: 'Pet & Animal Transport',
    icon: <MapPin className="w-6 h-6" />,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.1)',
    description: 'Specialized certified transport for pets, livestock, and exotic animals with wellness monitoring.',
    services: ['Dogs & Cats', 'Equine', 'Livestock', 'Birds & Exotics', 'Reptiles', 'Aquatic Species'],
    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?fm=jpg&fit=crop&w=600&q=80',
    stats: 'IATA / USDA / CITES certified',
  },
];

const TrackingCategoriesSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const branch = trackingBranches[active];

  return (
    <section id="services" className="py-24 overflow-hidden" style={{ background: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal direction="bottom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(79,142,247,0.1)', color: ACCENT, border: '1px solid rgba(79,142,247,0.2)' }}>
              <Globe size={12} /> Our Tracking Branches
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: N900 }}>
              One Platform. Every Tracking Need.
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Next Track's branch system organizes every type of shipment and asset into a dedicated tracking module — built for precision at scale.
            </p>
          </div>
        </Reveal>

        {/* Branch tabs */}
        <Reveal direction="bottom" delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {trackingBranches.map((b, i) => (
              <button key={b.category} onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active === i ? 'text-white shadow-lg scale-105' : 'text-slate-600 bg-white border border-slate-200 hover:border-slate-300'}`}
                style={active === i ? { background: `linear-gradient(135deg, ${N700}, ${b.color})`, border: 'none' } : {}}>
                <span style={{ color: active === i ? 'white' : b.color }}>{b.icon}</span>
                {b.category}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Active branch detail */}
        <Reveal direction="bottom" delay={0.15} key={active}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left info */}
            <div className="rounded-2xl p-8 flex flex-col justify-between"
              style={{ background: N900, border: '1px solid rgba(79,142,247,0.15)' }}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${N600}, ${branch.color})` }}>
                    {branch.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{branch.category}</h3>
                    <p className="text-xs" style={{ color: branch.color }}>{branch.stats}</p>
                  </div>
                </div>
                <p className="text-slate-400 mb-7 leading-relaxed">{branch.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {branch.services.map(s => (
                    <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: branch.color }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <Link to="#track" onClick={e => e.preventDefault()}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
                style={{ color: branch.color }}>
                Start Tracking <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right image */}
            <div className="relative rounded-2xl overflow-hidden min-h-[320px] shadow-2xl">
              <img src={branch.img} alt={branch.category} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${N900}cc 0%, transparent 60%)` }} />
              {/* Stat badge */}
              <div className="absolute bottom-5 left-5 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(79,142,247,0.2)' }}>
                <p className="text-xs text-slate-400">Coverage</p>
                <p className="text-sm font-bold text-white">{branch.stats}</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Summary card grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-10">
          {trackingBranches.map((b, i) => (
            <Reveal key={b.category} direction="bottom" delay={i * 0.05}>
              <button onClick={() => setActive(i)}
                className={`p-4 rounded-xl text-center transition-all duration-300 border pro-card w-full ${active === i ? 'shadow-lg' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                style={active === i ? { background: N800, border: `1px solid ${b.color}44` } : {}}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ background: b.bg, color: b.color }}>
                  {b.icon}
                </div>
                <p className={`text-xs font-semibold ${active === i ? 'text-white' : 'text-slate-700'}`}>{b.category}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PLATFORM CAPABILITIES
═══════════════════════════════════════════════════════════════════════════ */
const capabilities = [
  { icon: <Zap className="w-6 h-6" />,     title: 'Real-Time Intelligence',  desc: 'Sub-second updates from GPS, RFID, and IoT sensors across all modes.', color: '#f59e0b' },
  { icon: <Shield className="w-6 h-6" />,   title: 'Security & Compliance',   desc: 'End-to-end encryption, SOC 2 Type II, GDPR, and AEO authorised.', color: '#10b981' },
  { icon: <BarChart2 className="w-6 h-6" />, title: 'Advanced Analytics',      desc: 'Predictive ETAs, delay risk scoring, and full performance dashboards.', color: '#a78bfa' },
  { icon: <Globe className="w-6 h-6" />,    title: 'Global Network',           desc: '190+ countries, 500+ ports, 100+ airline partners integrated.', color: '#4f8ef7' },
  { icon: <Users className="w-6 h-6" />,    title: 'Multi-Stakeholder Access', desc: 'Role-based portals for shippers, carriers, customs, and receivers.', color: '#f43f5e' },
  { icon: <Lock className="w-6 h-6" />,     title: 'Chain of Custody',         desc: 'Immutable audit trail with digital signatures at each handover point.', color: '#0ea5e9' },
];

const CapabilitiesSection: React.FC = () => (
  <section className="py-24" style={{ background: N900 }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd', border: '1px solid rgba(79,142,247,0.25)' }}>
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Enterprise. <br/>Designed for Everyone.</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Industrial-grade logistics technology made accessible to businesses of every size.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((c, i) => (
          <Reveal key={c.title} direction="bottom" delay={i * 0.07}>
            <div className="p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-2px] group"
              style={{ background: N800, border: '1px solid rgba(79,142,247,0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${c.color}18`, color: c.color }}>
                {c.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{c.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export { HeroSection, TrackingCategoriesSection, CapabilitiesSection };
