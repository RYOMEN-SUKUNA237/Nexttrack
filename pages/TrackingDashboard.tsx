import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PawPrint, MapPin, Heart, Shield, Clock, CheckCircle, Pause, Truck, Plane, Ship, ChevronRight, AlertTriangle, Navigation } from 'lucide-react';
import Layout from '../components/Layout';
import { trackPet } from '../services/api';
import { speciesEmoji, statusColor, healthColor } from './admin/types';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN, initMapbox, interpolateAlongRoute, getRouteWithFallback, ROUTE_STYLE } from '../utils/mapbox';

const STEP_LABELS = [
  { key: 'pending',          label: 'Registered',       icon: '📋' },
  { key: 'picked-up',        label: 'Picked Up',        icon: '🐾' },
  { key: 'in-transit',       label: 'In Transit',       icon: '🚚' },
  { key: 'out-for-delivery', label: 'Almost There',     icon: '📍' },
  { key: 'delivered',        label: 'Delivered Safely', icon: '✅' },
];

const TRANSPORT_ICON: Record<string, React.ReactNode> = {
  air: <Plane size={16} />, sea: <Ship size={16} />, road: <Truck size={16} />,
};

const TrackingDashboard: React.FC = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);
  const [routeGeo, setRouteGeo] = useState<any>(null);

  useEffect(() => {
    if (!trackingId) return;
    trackPet(trackingId)
      .then(async (res: any) => {
        setData(res);
        const s = res.shipment;
        if (s) {
          // fetch route if not present
          let route = s.route_data;
          if (typeof route === 'string') route = JSON.parse(route);
          if (!route && s.origin_lat && s.origin_lng && s.dest_lat && s.dest_lng) {
            try {
              const routeData = await getRouteWithFallback([s.origin_lng, s.origin_lat], [s.dest_lng, s.dest_lat]);
              route = routeData?.geometry;
            } catch (e) {}
          }
          setRouteGeo(route);
        }
      })
      .catch((e: any) => setError(e.message || 'Transport not found.'))
      .finally(() => setLoading(false));
  }, [trackingId]);

  const t = data?.shipment;
  const history = data?.history || [];
  const handler = data?.courier;

  const currentStep = STEP_LABELS.findIndex(s => s.key === t?.status);
  const progress = t?.computed_progress ?? t?.progress ?? 0;

  useEffect(() => {
    if (!t || !MAPBOX_TOKEN || !mapContainer.current) return;
    initMapbox();

    if (!mapRef.current) {
      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.5,
        projection: 'globe',
      });
      m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
      m.on('style.load', () => {
        m.setFog({
          color: 'rgb(10, 25, 47)',
          'high-color': 'rgb(20, 40, 80)',
          'horizon-blend': 0.08,
          'space-color': 'rgb(5, 10, 20)',
          'star-intensity': 0.6,
        });
      });
      mapRef.current = m;
    }

    const m = mapRef.current;
    
    const drawMap = () => {
      // Draw route
      if (routeGeo && m.isStyleLoaded()) {
        const sourceId = 'route';
        if (!m.getSource(sourceId)) {
          m.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: routeGeo } as any });
          m.addLayer({
            id: 'route-glow', type: 'line', source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': ROUTE_STYLE.glowColor, 'line-width': ROUTE_STYLE.glowWidth, 'line-opacity': ROUTE_STYLE.glowOpacity },
          });
          m.addLayer({
            id: 'route-line', type: 'line', source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': ROUTE_STYLE.color, 'line-width': ROUTE_STYLE.width, 'line-dasharray': t.is_paused ? ROUTE_STYLE.pausedDash : ROUTE_STYLE.activeDash },
          });
        }
      }

      // Draw Marker
      let markerLng = t.origin_lng || 0;
      let markerLat = t.origin_lat || 0;

      if (routeGeo && routeGeo.coordinates) {
        const pos = interpolateAlongRoute(routeGeo.coordinates, progress);
        markerLng = pos[0]; markerLat = pos[1];
      } else if (t.origin_lng && t.dest_lng) {
        const p = progress / 100;
        markerLng = t.origin_lng + (t.dest_lng - t.origin_lng) * p;
        markerLat = t.origin_lat + (t.dest_lat - t.origin_lat) * p;
      }

      if (!markerRef.current) {
        const el = document.createElement('div');
        const color = t.is_paused ? '#f59e0b' : '#3b82f6';
        el.innerHTML = `<div style="position:relative;">
          ${!t.is_paused ? `<div style="width:32px;height:32px;border-radius:50%;background:${color};opacity:0.3;position:absolute;top:-8px;left:-8px;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
          <div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:1;"></div>
        </div>`;
        markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([markerLng, markerLat]).addTo(m);
        m.flyTo({ center: [markerLng, markerLat], zoom: 4, duration: 2000 });
      } else {
        markerRef.current.setLngLat([markerLng, markerLat]);
      }
    };

    if (m.isStyleLoaded()) {
      drawMap();
    } else {
      m.once('idle', drawMap);
    }
  }, [t, progress, routeGeo]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-12 h-12 mx-auto animate-bounce mb-4" style={{ color: '#F59E0B' }} />
          <p className="text-gray-500">Locating your pet's journey...</p>
        </div>
      </div>
    </Layout>
  );

  if (error || !t) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-7xl">🔍</span>
          <h2 className="text-2xl font-bold mt-6 mb-2" style={{ color: '#0D4B4D' }}>Transport Not Found</h2>
          <p className="text-gray-500 mb-6">{error || `No transport found for ID "${trackingId}".`}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
            <PawPrint size={18} /> Back to Next Track
          </Link>
        </div>
      </div>
    </Layout>
  );

  const isPaused = t.is_paused;

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(180deg,#FFF8F0 0%,#fff 100%)' }}>
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Header card */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="rounded-3xl overflow-hidden shadow-xl"
            style={{ background: 'linear-gradient(135deg,#0D4B4D 0%,#0a3335 100%)' }}>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PawPrint className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-wide">Next Track</span>
                  </div>
                  <p className="text-teal-300 text-sm mb-1">Tracking ID</p>
                  <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">{t.tracking_id}</h1>
                </div>
                <div className="flex-shrink-0">
                  {isPaused ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white font-semibold text-sm">
                      <Pause size={16} /> Transport Paused
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusColor(t.status)}`}>
                      {t.status === 'delivered' ? <CheckCircle size={16} /> : <Clock size={16} />}
                      {t.status.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3 mt-6">
                <div className="text-center">
                  <p className="text-teal-400 text-xs uppercase tracking-wide">From</p>
                  <p className="text-white font-bold mt-0.5">{t.origin}</p>
                </div>
                <div className="flex-1 flex items-center gap-2 px-3">
                  <div className="flex-1 h-px bg-teal-600" />
                  <span className="text-teal-400">{TRANSPORT_ICON[t.transport_type] || <Truck size={16} />}</span>
                  <div className="flex-1 h-px bg-teal-600" />
                </div>
                <div className="text-center">
                  <p className="text-teal-400 text-xs uppercase tracking-wide">To</p>
                  <p className="text-white font-bold mt-0.5">{t.destination}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-teal-400 mb-1.5">
                  <span>Journey Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-3 bg-teal-900 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }}
                    style={{ background: 'linear-gradient(90deg,#F59E0B,#FCD34D)' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Live Map */}
          {MAPBOX_TOKEN && t.origin_lng && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden relative" style={{ height: '350px' }}>
              <div ref={mapContainer} className="absolute inset-0" />
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0a192f]">
                  <Navigation size={14} className="text-blue-500" /> Live Tracking Map
                </span>
              </div>
            </motion.div>
          )}

          {/* Pause alert */}
          {isPaused && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700">Transport Temporarily Paused</p>
                {t.pause_category && <p className="text-sm text-red-600 mt-0.5">Reason: <strong>{t.pause_category}</strong></p>}
                {t.pause_reason && <p className="text-sm text-red-500 mt-1">{t.pause_reason}</p>}
                <p className="text-xs text-red-400 mt-2">Our team is monitoring the situation. Your pet is safe and comfortable.</p>
              </div>
            </motion.div>
          )}

          {/* Pet info card */}
          {t.pet_id && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md border border-amber-100 p-6">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: '#0D4B4D' }}>🐾 Pet Details</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                  {t.photo_url ? <img src={t.photo_url} alt={t.pet_name} className="w-full h-full object-cover" /> : speciesEmoji(t.pet_species || 'Other')}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold" style={{ color: '#0D4B4D' }}>{t.pet_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{t.pet_species || ''} {t.pet_breed ? `• ${t.pet_breed}` : ''}</p>
                  {t.pet_health && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${healthColor(t.pet_health)}`}>
                      Health: {t.pet_health}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Journey Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-md border border-amber-100 p-6">
            <h2 className="font-bold text-sm uppercase tracking-wide mb-6" style={{ color: '#0D4B4D' }}>Journey Milestones</h2>
            <div className="relative">
              {STEP_LABELS.map((step, idx) => {
                const done = idx <= currentStep && !isPaused;
                const active = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-start gap-4 mb-5 last:mb-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        done ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'
                      }`} style={done ? { background: 'linear-gradient(135deg,#F59E0B,#D97706)' } : {}}>
                        {done ? <CheckCircle size={16} className="text-white" /> : <span className="text-lg">{step.icon}</span>}
                      </div>
                      {idx < STEP_LABELS.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 rounded-full ${done ? 'bg-amber-400' : 'bg-gray-100'}`} />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-semibold text-sm ${active ? 'text-amber-600' : done ? '' : 'text-gray-400'}`}
                        style={active ? {} : done ? { color: '#0D4B4D' } : {}}>
                        {step.label}
                        {active && !isPaused && <span className="ml-2 text-xs font-normal text-amber-500 animate-pulse">● Active</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Handler info */}
          {handler && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md border border-amber-100 p-6">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: '#0D4B4D' }}>🧑‍⚕️ Your Pet Handler</h2>
              <div className="flex items-center gap-4">
                <img src={handler.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(handler.name)}&background=F59E0B&color=fff&size=80`}
                  alt={handler.name} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <p className="font-bold" style={{ color: '#0D4B4D' }}>{handler.name}</p>
                  <p className="text-sm text-gray-500">{handler.vehicle_type}</p>
                  {handler.certified_species && (
                    <p className="text-xs text-teal-600 mt-1">Certified: {handler.certified_species}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* History */}
          {history.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl shadow-md border border-amber-100 p-6">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: '#0D4B4D' }}>📜 Activity Log</h2>
              <div className="space-y-3">
                {history.slice(0, 8).map((h: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#F59E0B' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#0D4B4D' }}>{h.event || h.status}</p>
                      {h.note && <p className="text-gray-400 text-xs mt-0.5">{h.note}</p>}
                      <p className="text-gray-400 text-xs">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ETA + CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg,#FFF8F0,#FEF3C7)' }}>
            {t.estimated_delivery && (
              <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
            )}
            {t.estimated_delivery && (
              <p className="text-xl font-bold mb-4" style={{ color: '#0D4B4D' }}>
                {new Date(t.estimated_delivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Heart size={14} className="text-red-400" />
              Your pet is in certified caring hands with Next Track.
              <Shield size={14} className="text-teal-600" />
            </p>
            <Link to="/" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg,#0D4B4D,#0a3335)' }}>
              <PawPrint size={16} /> Back to Next Track <ChevronRight size={14} />
            </Link>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};

export default TrackingDashboard;
