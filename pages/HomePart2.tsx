import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, ChevronDown, ChevronUp, Shield, Clock, Award, BarChart2, Zap, Globe, RefreshCw, MapPin, Plane } from 'lucide-react';
import Reveal from '../components/ui/Reveal';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../utils/mapbox';

const N900 = '#0a1628';
const N800 = '#0f2040';
const N600 = '#1e3a6e';
const ACCENT = '#4f8ef7';

/* ── LIVE DEMO MAP ──────────────────────────────────────────────────────── */
// Route waypoints: Dubai → Gulf → Iran → Turkey → Eastern Europe → London
const ROUTE_COORDS: [number, number][] = [
  [55.2708, 25.2048],
  [51.5,    26.0],
  [48.0,    29.0],
  [44.0,    32.0],
  [38.0,    37.0],
  [30.0,    41.0],
  [20.0,    44.0],
  [10.0,    48.0],
  [2.0,     49.5],
  [-0.1276, 51.5074],
];

function lerpCoord(coords: [number, number][], t: number): [number, number] {
  if (t <= 0) return coords[0];
  if (t >= 1) return coords[coords.length - 1];
  const totalSegments = coords.length - 1;
  const scaledT = t * totalSegments;
  const segIdx = Math.min(Math.floor(scaledT), totalSegments - 1);
  const segT = scaledT - segIdx;
  const from = coords[segIdx];
  const to = coords[segIdx + 1];
  return [from[0] + (to[0] - from[0]) * segT, from[1] + (to[1] - from[1]) * segT];
}

const LiveDemoMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const progressRef = useRef(0.52); // start at ~52% (over Eastern Europe)
  const [displayPct, setDisplayPct] = useState(0.52);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(8);

  const TOKEN = MAPBOX_TOKEN;

  /* ── Init map ── */
  useEffect(() => {
    if (!mapContainerRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 40],
      zoom: 2.6,
      interactive: true,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      // Full route line
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: ROUTE_COORDS },
        },
      });
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#4f8ef7', 'line-width': 8, 'line-opacity': 0.15, 'line-blur': 10 },
      });
      map.addLayer({
        id: 'route-dash',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#4f8ef7', 'line-width': 1.5, 'line-opacity': 0.6, 'line-dasharray': [4, 4] },
      });

      // Origin dot (Dubai — orange)
      const originEl = document.createElement('div');
      originEl.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#fb923c;border:2px solid white;box-shadow:0 0 8px #fb923c';
      new mapboxgl.Marker({ element: originEl, anchor: 'center' }).setLngLat(ROUTE_COORDS[0]).setPopup(new mapboxgl.Popup({ offset: 10 }).setText('Dubai — Origin')).addTo(map);

      // Destination dot (London — green)
      const destEl = document.createElement('div');
      destEl.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#34d399;border:2px solid white;box-shadow:0 0 8px #34d399';
      new mapboxgl.Marker({ element: destEl, anchor: 'center' }).setLngLat(ROUTE_COORDS[ROUTE_COORDS.length - 1]).setPopup(new mapboxgl.Popup({ offset: 10 }).setText('London — Destination')).addTo(map);

      // Aircraft marker
      const planeEl = document.createElement('div');
      planeEl.innerHTML = '✈';
      planeEl.style.cssText = 'font-size:22px;filter:drop-shadow(0 0 8px #4f8ef7);transform:rotate(50deg);cursor:default;user-select:none;transition:all 0.8s ease;';
      const pos = lerpCoord(ROUTE_COORDS, progressRef.current);
      const marker = new mapboxgl.Marker({ element: planeEl, anchor: 'center' })
        .setLngLat(pos)
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML('<strong style="color:#4f8ef7">NT-4821</strong><br/><span style="font-size:11px;color:#94a3b8">Air Freight · Dubai → London</span>'))
        .addTo(map);
      markerRef.current = marker;
    });

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TOKEN]);

  /* ── 8-second refresh cycle ── */
  useEffect(() => {
    const tick = () => {
      const newPct = Math.min(progressRef.current + 0.03 + Math.random() * 0.015, 0.99);
      progressRef.current = newPct;
      const newPos = lerpCoord(ROUTE_COORDS, newPct);
      if (markerRef.current) markerRef.current.setLngLat(newPos);
      setDisplayPct(newPct);
      setLastRefresh(new Date());
      setCountdown(8);
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 1300);
    };

    const refreshTimer = setInterval(tick, 8000);
    const countdownTimer = setInterval(() => setCountdown(n => (n <= 1 ? 8 : n - 1)), 1000);
    return () => { clearInterval(refreshTimer); clearInterval(countdownTimer); };
  }, []);

  const etaTotalMins = Math.round((1 - displayPct) * 620);
  const etaH = Math.floor(etaTotalMins / 60);
  const etaM = etaTotalMins % 60;

  if (!TOKEN) return (
    <div className="mt-8 rounded-2xl overflow-hidden text-center py-12"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(79,142,247,0.15)' }}>
      <MapPin className="w-8 h-8 mx-auto mb-3 text-slate-500" />
      <p className="text-slate-500 text-sm">Live map requires a Mapbox token (VITE_MAPBOX_TOKEN)</p>
    </div>
  );

  return (
    <div className="mt-10 rounded-2xl overflow-hidden shadow-2xl text-left"
      style={{ border: '1px solid rgba(79,142,247,0.22)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(10,22,40,0.97)', borderBottom: '1px solid rgba(79,142,247,0.15)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-white">Live Tracking Demo</span>
          <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold ml-1"
            style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd' }}>NT-4821 · Dubai → London</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {refreshing ? (
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" /> Refreshing…
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <RefreshCw className="w-3 h-3" /> Next update in {countdown}s
            </span>
          )}
          <span className="hidden sm:block text-slate-600">·</span>
          <span className="hidden sm:block text-slate-500">{lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Mapbox canvas */}
      <div ref={mapContainerRef} style={{ height: '340px', width: '100%' }} />

      {/* Data panel */}
      <div style={{ background: 'rgba(10,22,40,0.97)', borderTop: '1px solid rgba(79,142,247,0.15)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 text-left"
          style={{ borderTop: '1px solid rgba(79,142,247,0.08)' }}>
          {/* Shipment */}
          <div className="px-5 py-4 sm:border-r" style={{ borderColor: 'rgba(79,142,247,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Plane className="w-4 h-4 flex-shrink-0" style={{ color: '#4f8ef7' }} />
              <span className="text-white text-sm font-bold font-mono">NT-4821</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd' }}>Air Freight</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs mb-3">
              <span className="font-medium" style={{ color: '#fb923c' }}>Dubai, UAE</span>
              <span className="text-slate-500">→</span>
              <span className="font-medium" style={{ color: '#34d399' }}>London, UK</span>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-slate-500 uppercase tracking-wide">Progress</span>
                <span className="font-semibold" style={{ color: ACCENT }}>{Math.round(displayPct * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full transition-all duration-[1200ms]"
                  style={{ width: `${displayPct * 100}%`, background: 'linear-gradient(90deg, #2952a3, #4f8ef7)' }} />
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="px-5 py-4 sm:border-r flex flex-col justify-center" style={{ borderColor: 'rgba(79,142,247,0.1)' }}>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Estimated Arrival</p>
            <p className="text-white font-bold text-lg transition-all duration-700">{etaH}h {etaM}m remaining</p>
            <p className="text-xs text-slate-400 mt-0.5">38,000 ft · 895 km/h · Emirates EK001</p>
          </div>

          {/* Status */}
          <div className="px-5 py-4 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Flight Status</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }} />
              <span className="text-sm font-semibold" style={{ color: '#34d399' }}>In Transit · On Schedule</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Over Eastern Europe · Customs Pre-Cleared</p>
            <p className="text-[10px] text-slate-600 mt-1.5 flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5" /> Auto-refreshes every 8 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── TRACK SECTION ──────────────────────────────────────────────────────── */
export const TrackSection: React.FC = () => {
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();
  const handleTrack = () => { if (trackId.trim()) navigate(`/track/${trackId.trim()}`); };

  const steps = [
    { label: 'Booked',     done: true },
    { label: 'Collected',  done: true },
    { label: 'In Transit', done: true },
    { label: 'Customs',    done: false },
    { label: 'Delivered',  done: false },
  ];

  return (
    <section id="track" className="py-24 overflow-hidden relative" style={{ background: N800 }}>
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <Reveal direction="bottom">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd', border: '1px solid rgba(79,142,247,0.3)' }}>
            <Search size={12} /> Real-Time Tracking Portal
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Know Exactly Where Your Shipment Is — Always
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Enter any tracking ID to see live location, status updates, estimated delivery, and the full chain of custody.
          </p>
          <form onSubmit={e => { e.preventDefault(); handleTrack(); }} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text" value={trackId} onChange={e => setTrackId(e.target.value)}
              placeholder="Enter tracking ID (e.g. NT-8842-X9)"
              className="flex-1 h-14 px-5 rounded-xl text-sm font-mono outline-none text-white placeholder-slate-500"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(79,142,247,0.35)' }}
            />
            <button type="submit"
              className="h-14 px-8 rounded-xl font-semibold text-white flex items-center gap-2 justify-center transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>
              <Search className="w-4 h-4" /> Track Now
            </button>
          </form>
          <p className="text-xs mt-4 text-slate-500">
            Demo: <button onClick={() => navigate('/track/PT-8842-X9')} className="underline hover:text-blue-400 transition-colors">PT-8842-X9</button>
          </p>
        </Reveal>

        {/* Stepper */}
        <Reveal direction="bottom" delay={0.15}>
          <div className="mt-12 flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}
                    style={{
                      background: step.done ? `linear-gradient(135deg, #2952a3, ${ACCENT})` : 'rgba(255,255,255,0.07)',
                      border: step.done ? 'none' : '1.5px solid rgba(255,255,255,0.1)',
                    }}>
                    {step.done ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <p className="text-xs font-medium" style={{ color: step.done ? '#93c5fd' : '#475569' }}>{step.label}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-0.5 w-8 sm:w-12 rounded mb-5"
                    style={{ background: step.done ? ACCENT : 'rgba(255,255,255,0.08)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Reveal>

        {/* Live Demo Map */}
        <Reveal direction="bottom" delay={0.25}>
          <LiveDemoMap />
        </Reveal>
      </div>
    </section>
  );
};

/* ── WHY US ─────────────────────────────────────────────────────────────── */
const whyUs = [
  { icon: <Shield className="w-7 h-7" />,    title: 'Certified & Compliant',   desc: 'ISO 9001, AEO, IATA, GDPR and SOC 2 Type II certified. Every shipment is audit-ready.', color: '#10b981' },
  { icon: <Zap className="w-7 h-7" />,       title: 'Sub-Second Updates',      desc: 'Live GPS, RFID, and IoT sensors deliver real-time position data every few seconds.', color: ACCENT },
  { icon: <Clock className="w-7 h-7" />,     title: '24/7 Operations Center',  desc: 'Our global ops team monitors all shipments around the clock with proactive alerts.', color: '#f59e0b' },
  { icon: <Award className="w-7 h-7" />,     title: '98.7% On-Time Rate',      desc: 'Industry-leading delivery performance across all transport modes and geographies.', color: '#a78bfa' },
  { icon: <BarChart2 className="w-7 h-7" />, title: 'Predictive Analytics',    desc: 'AI-powered delay risk scoring, predictive ETAs, and carrier performance benchmarks.', color: '#f43f5e' },
  { icon: <Globe className="w-7 h-7" />,     title: 'Global Network',          desc: '190+ countries, 500+ port integrations, 100+ airline partners — truly worldwide.', color: '#0ea5e9' },
];

export const WhyUsSection: React.FC = () => (
  <section id="why-us" className="py-24" style={{ background: '#f8fafc' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'rgba(79,142,247,0.1)', color: ACCENT, border: '1px solid rgba(79,142,247,0.2)' }}>
            Why Next Track
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: N900 }}>The Professional Standard in Logistics Tracking</h2>
          <p className="text-slate-500 max-w-xl mx-auto">We go beyond tracking — we deliver intelligence, compliance, and peace of mind.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {whyUs.map((w, i) => (
          <Reveal key={w.title} direction="bottom" delay={i * 0.08}>
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${w.color}15`, color: w.color }}>
                {w.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: N900 }}>{w.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{w.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── FAQ ────────────────────────────────────────────────────────────────── */
const faqs = [
  { q: 'What types of shipments can Next Track monitor?', a: 'Next Track covers all major logistics modes: parcels, road freight (FTL/LTL), air cargo, sea freight (containers, bulk), live IoT assets, and specialized pet & animal transport. Every category has its own dedicated tracking module with mode-specific data fields.' },
  { q: 'How does real-time tracking work?', a: 'We integrate with GPS devices, RFID tags, carrier APIs, port and airline data feeds, and IoT sensor networks. Data is aggregated in real time and pushed to your dashboard every few seconds with sub-second latency for premium asset tracking.' },
  { q: 'How do I get a tracking ID?', a: 'Your tracking ID is assigned at the time of booking. It follows the format NT-XXXX-XX. You will receive it via email confirmation. You can also find it in your shipper portal or by contacting our 24/7 support team.' },
  { q: 'Can I track international shipments through customs?', a: 'Yes. Next Track integrates with customs authorities in 190+ countries, providing real-time customs clearance status, document readiness alerts, and estimated release times. Our compliance team can also assist with documentation.' },
  { q: 'What is the pet and animal transport service?', a: 'Our pet transport branch is a specialized certified service (IATA LAR, USDA, CITES) for transporting animals including pets, equine, livestock, birds, reptiles, and exotic species. It includes wellness monitoring, comfort check logs, and 24/7 veterinary on-call support — all tracked within the same platform.' },
  { q: 'Do you offer API integration for enterprise clients?', a: 'Yes. Our RESTful API and webhook system allows full integration with ERP, WMS, OMS, and TMS platforms. We support EDI, JSON, and XML formats with dedicated sandbox environments for testing.' },
];

export const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24" style={{ background: N900 }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal direction="bottom">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd', border: '1px solid rgba(79,142,247,0.25)' }}>
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
        </Reveal>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <Reveal key={i} direction="bottom" delay={i * 0.04}>
              <div className="rounded-xl overflow-hidden" style={{ background: N800, border: '1px solid rgba(79,142,247,0.12)' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5">
                  <span className="font-semibold text-sm pr-4 text-white">{f.q}</span>
                  {open === i
                    ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }} />
                    : <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-500" />}
                </button>
                {open === i && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t pt-3" style={{ borderColor: 'rgba(79,142,247,0.1)' }}>{f.a}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
