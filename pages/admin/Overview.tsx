import React, { useEffect, useState, useRef } from 'react';
import {
  Package, Activity, CheckCircle, Pause, Users, Clock,
  TrendingUp, BarChart2, Globe, Truck, Plane, Ship,
  ArrowUpRight, ArrowDownRight, MapPin
} from 'lucide-react';
import { getDashboardStats } from '../../services/api';

/* ── Design tokens ───────────────────────────────────────────────────────── */
const N900 = '#0a1628';
const N800 = '#0f2040';
const N700 = '#152b55';
const N600 = '#1e3a6e';
const ACCENT = '#4f8ef7';

/* ══════════════════════════════════════════════════════════════════════════
   SIMULATED LIVE MAP
   Shows 2 points (origin & destination) with an animated dot traveling
   along a curved SVG path.
══════════════════════════════════════════════════════════════════════════ */
const LiveRouteMap: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'moving' | 'arrived'>('moving');
  const animRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | null>(null);
  const DURATION = 8000; // 8 seconds per trip

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        setStatus('arrived');
        setTimeout(() => {
          startRef.current = null;
          setStatus('moving');
          setProgress(0);
        }, 2000);
      } else {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [status === 'moving' && progress === 0]);

  /* SVG layout */
  const W = 560, H = 200;
  const A = { x: 70,  y: 140, label: 'Dubai, UAE',    code: 'DXB' };
  const B = { x: 490, y: 60,  label: 'London, UK',    code: 'LHR' };
  // Cubic bezier control points for arc
  const cp1 = { x: 180, y: 20 };
  const cp2 = { x: 380, y: 10 };

  // Compute point on cubic bezier at t
  const bezier = (t: number) => {
    const mt = 1 - t;
    return {
      x: mt*mt*mt*A.x + 3*mt*mt*t*cp1.x + 3*mt*t*t*cp2.x + t*t*t*B.x,
      y: mt*mt*mt*A.y + 3*mt*mt*t*cp1.y + 3*mt*t*t*cp2.y + t*t*t*B.y,
    };
  };

  const dotPos = bezier(progress);
  const pathD = `M ${A.x} ${A.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${B.x} ${B.y}`;

  // Trail — partial path (SVG trick using dashoffset)
  // Calculate approximate total path length for animation
  const TOTAL_PATH_LEN = 620;
  const trailLen = progress * TOTAL_PATH_LEN;

  const statusLabel = status === 'arrived' ? 'Arrived at LHR' : `In Transit · ${Math.round(progress * 100)}% complete`;
  const eta = status === 'arrived' ? 'Delivered' : `ETA: ${Math.round((1 - progress) * 7.2)}h ${Math.round(((1 - progress) * 7.2 % 1) * 60)}m`;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: N800, border: '1px solid rgba(79,142,247,0.15)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(79,142,247,0.12)' }}>
        <div>
          <h3 className="font-bold text-white text-sm">Live Route Simulation</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">NT-2849-AF · Air Freight · 2 waypoints</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: status === 'arrived' ? 'rgba(16,185,129,0.15)' : 'rgba(79,142,247,0.15)', color: status === 'arrived' ? '#34d399' : '#93c5fd' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: status === 'arrived' ? '#34d399' : ACCENT }} />
          {status === 'arrived' ? 'Arrived' : 'Live Tracking'}
        </div>
      </div>

      {/* SVG Map */}
      <div className="px-4 py-3" style={{ background: 'rgba(5,13,26,0.6)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
          {/* World map subtle background lines */}
          <defs>
            <pattern id="mapgrid" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(79,142,247,0.07)" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(79,142,247,0.05)" strokeWidth="0.5" />
            </pattern>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={ACCENT} opacity="0.6" />
            </marker>
            {/* Gradient for trail */}
            <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.1" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#mapgrid)" />

          {/* Faint full route */}
          <path d={pathD} fill="none" stroke="rgba(79,142,247,0.2)" strokeWidth="1.5" strokeDasharray="6 4" />

          {/* Animated trail */}
          <path d={pathD} fill="none" stroke="url(#trailGrad)" strokeWidth="2.5"
            strokeDasharray={`${trailLen} ${TOTAL_PATH_LEN}`} strokeLinecap="round" />

          {/* Origin point A */}
          <circle cx={A.x} cy={A.y} r="8" fill="rgba(79,142,247,0.2)" stroke={ACCENT} strokeWidth="2" />
          <circle cx={A.x} cy={A.y} r="4" fill={ACCENT} />
          <text x={A.x} y={A.y + 20} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">{A.code}</text>
          <text x={A.x} y={A.y + 32} textAnchor="middle" fill="#475569" fontSize="9">{A.label}</text>

          {/* Destination point B */}
          <circle cx={B.x} cy={B.y} r="8"
            fill={status === 'arrived' ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)'}
            stroke={status === 'arrived' ? '#34d399' : '#475569'} strokeWidth="2" />
          <circle cx={B.x} cy={B.y} r="4" fill={status === 'arrived' ? '#34d399' : '#475569'} />
          <text x={B.x} y={B.y + 20} textAnchor="middle" fill={status === 'arrived' ? '#34d399' : '#93c5fd'} fontSize="11" fontWeight="600">{B.code}</text>
          <text x={B.x} y={B.y + 32} textAnchor="middle" fill="#475569" fontSize="9">{B.label}</text>

          {/* Moving dot (plane) */}
          {status === 'moving' && (
            <g transform={`translate(${dotPos.x}, ${dotPos.y})`}>
              <circle r="7" fill="rgba(79,142,247,0.3)" />
              <circle r="7" fill="none" stroke={ACCENT} strokeWidth="1.5">
                <animate attributeName="r" values="7;13;7" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill={ACCENT} />
              {/* Plane icon approximation */}
              <text x="-4" y="4" fill="white" fontSize="8">✈</text>
            </g>
          )}
          {status === 'arrived' && (
            <g transform={`translate(${B.x}, ${B.y})`}>
              <circle r="12" fill="rgba(16,185,129,0.2)">
                <animate attributeName="r" values="8;18;8" dur="1.5s" repeatCount="3" />
                <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="3" />
              </circle>
              <circle r="5" fill="#34d399" />
            </g>
          )}
        </svg>
      </div>

      {/* Status bar */}
      <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: 'rgba(79,142,247,0.12)' }}>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 w-48 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.round(progress * 100)}%`, background: status === 'arrived' ? '#34d399' : `linear-gradient(90deg, #2952a3, ${ACCENT})` }} />
          </div>
          <span className="text-xs text-slate-400">{statusLabel}</span>
        </div>
        <div className="text-xs font-semibold" style={{ color: status === 'arrived' ? '#34d399' : '#93c5fd' }}>{eta}</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   OVERVIEW DASHBOARD
══════════════════════════════════════════════════════════════════════════ */
const Overview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((d: any) => setData(d)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const cards = [
    { label: 'Total Shipments',    value: (stats.totalPets ?? 0) + (stats.totalShipments ?? 0), icon: <Package className="w-5 h-5" />,       color: ACCENT,     bg: 'rgba(79,142,247,0.12)',  trend: '+12%' },
    { label: 'Active Transports',  value: stats.activeTransports ?? 0,                           icon: <Activity className="w-5 h-5" />,       color: '#10b981',  bg: 'rgba(16,185,129,0.12)', trend: '+5%' },
    { label: 'Delivered',          value: stats.delivered ?? 0,                                   icon: <CheckCircle className="w-5 h-5" />,     color: '#34d399',  bg: 'rgba(52,211,153,0.12)', trend: '+8%' },
    { label: 'On Hold / Paused',   value: stats.paused ?? 0,                                      icon: <Pause className="w-5 h-5" />,           color: '#f43f5e',  bg: 'rgba(244,63,94,0.12)',  trend: '-2%' },
    { label: 'Active Handlers',    value: stats.totalHandlers ?? 0,                               icon: <Users className="w-5 h-5" />,           color: '#a78bfa',  bg: 'rgba(167,139,250,0.12)', trend: '0%' },
    { label: 'Pending Transports', value: stats.pendingTransports ?? 0,                           icon: <Clock className="w-5 h-5" />,           color: '#f59e0b',  bg: 'rgba(245,158,11,0.12)', trend: '+3%' },
    { label: 'Pending Reviews',    value: stats.pendingReviews ?? 0,                              icon: <TrendingUp className="w-5 h-5" />,      color: '#0ea5e9',  bg: 'rgba(14,165,233,0.12)', trend: '+1%' },
    { label: 'Pending Quotes',     value: stats.pendingQuotes ?? 0,                               icon: <BarChart2 className="w-5 h-5" />,       color: '#fb923c',  bg: 'rgba(251,146,60,0.12)', trend: '+7%' },
  ];

  /* Tracking branch distribution — synthetic fallback */
  const branches = [
    { label: 'Parcel & Cargo',  icon: <Package size={14} />,  color: ACCENT,     value: 38, cnt: 284 },
    { label: 'Road Freight',    icon: <Truck size={14} />,     color: '#10b981',  value: 27, cnt: 201 },
    { label: 'Air Freight',     icon: <Plane size={14} />,     color: '#a78bfa',  value: 18, cnt: 134 },
    { label: 'Sea Freight',     icon: <Ship size={14} />,      color: '#f59e0b',  value: 10, cnt: 75 },
    { label: 'Pet Transport',   icon: <MapPin size={14} />,    color: '#0ea5e9',  value: 7,  cnt: 52 },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: N900 }}>Operations Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Live snapshot across all tracking branches · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => {
          const isPositive = c.trend.startsWith('+');
          const isNeutral = c.trend === '0%';
          return (
            <div key={c.label} className="rounded-2xl p-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.color }}>
                  {c.icon}
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? <ArrowUpRight size={12} /> : isNeutral ? null : <ArrowDownRight size={12} />}
                  {c.trend}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: N900 }}>{c.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Live Map + Branch breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live route map */}
        <div className="lg:col-span-2">
          <LiveRouteMap />
        </div>

        {/* Branch volume */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: N900 }}>Volume by Branch</h3>
          <div className="space-y-4">
            {branches.map(b => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: N900 }}>
                    <span style={{ color: b.color }}>{b.icon}</span>
                    {b.label}
                  </div>
                  <span className="text-xs text-slate-400">{b.cnt} shipments</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${b.value}%`, background: b.color }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{b.value}% of total volume</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transports + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent transports */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: N900 }}>Recent Shipments</h3>
            <span className="text-xs text-slate-400">All branches</span>
          </div>
          <div className="space-y-2">
            {(data?.recentTransports || [
              { tracking_id: 'NT-4821', cargo_type: 'Air Freight', origin: 'Dubai', destination: 'London', status: 'in-transit' },
              { tracking_id: 'NT-3309', cargo_type: 'Sea Cargo',   origin: 'Shanghai', destination: 'LA', status: 'in-transit' },
              { tracking_id: 'NT-7701', cargo_type: 'Road Freight', origin: 'Berlin', destination: 'Paris', status: 'delivered' },
              { tracking_id: 'NT-5512', pet_name: 'Max', species: 'Dog', origin: 'NYC', destination: 'Miami', status: 'pending' },
            ]).map((t: any) => (
              <div key={t.tracking_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${N700}, #2952a3)` }}>
                  {t.pet_name ? '🐾' : t.cargo_type?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: N900 }}>
                    {t.pet_name ? `${t.pet_name} (${t.species})` : t.cargo_type} · <span className="font-mono text-xs text-slate-400">{t.tracking_id}</span>
                  </p>
                  <p className="text-xs text-slate-400 truncate">{t.origin} → {t.destination}</p>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  t.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                  t.status === 'in-transit' ? 'bg-blue-50 text-blue-700' :
                  t.status === 'paused' ? 'bg-red-50 text-red-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: N900 }}>Notifications</h3>
          <div className="space-y-2">
            {(data?.notifications || [
              { id: 1, type: 'success', title: 'NT-7701 Delivered', message: 'Road freight delivered to Paris on time.' },
              { id: 2, type: 'warning', title: 'NT-3309 Customs Hold', message: 'Sea cargo requires additional documentation at LA port.' },
              { id: 3, type: 'info',    title: 'New Quote Request',   message: '3 new quote requests from enterprise clients.' },
              { id: 4, type: 'success', title: 'Handler Assigned',    message: 'Handler James O. assigned to NT-5512 (Pet).' },
            ]).slice(0, 5).map((n: any) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: n.type === 'warning' ? '#fefce8' : n.type === 'success' ? '#f0fdf4' : '#eff6ff' }}>
                <span className="text-base mt-0.5">{n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: N900 }}>{n.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
