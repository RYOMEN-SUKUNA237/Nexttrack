import React, { useEffect, useState } from 'react';
import { PawPrint, Activity, CheckCircle, Pause, Users, Clock, TrendingUp, Heart } from 'lucide-react';
import { getDashboardStats } from '../../services/api';
import { speciesEmoji, statusColor } from './types';

const Overview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <PawPrint className="w-10 h-10 mx-auto animate-bounce mb-3" style={{ color: '#F59E0B' }} />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const cards = [
    { label: 'Total Pets Registered', value: stats.totalPets ?? 0, icon: <PawPrint className="w-6 h-6" />, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Active Transports', value: stats.activeTransports ?? 0, icon: <Activity className="w-6 h-6" />, color: '#0D4B4D', bg: '#CCEBEB' },
    { label: 'Delivered Safely', value: stats.delivered ?? 0, icon: <CheckCircle className="w-6 h-6" />, color: '#059669', bg: '#D1FAE5' },
    { label: 'Currently Paused', value: stats.paused ?? 0, icon: <Pause className="w-6 h-6" />, color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Active Handlers', value: stats.totalHandlers ?? 0, icon: <Users className="w-6 h-6" />, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Pending Transport', value: stats.pendingTransports ?? 0, icon: <Clock className="w-6 h-6" />, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Pending Reviews', value: stats.pendingReviews ?? 0, icon: <TrendingUp className="w-6 h-6" />, color: '#0891B2', bg: '#CFFAFE' },
    { label: 'Pending Quotes', value: stats.pendingQuotes ?? 0, icon: <Heart className="w-6 h-6" />, color: '#DB2777', bg: '#FCE7F3' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#0D4B4D' }}>🐾 Dashboard Overview</h2>
        <p className="text-sm text-gray-500">Live snapshot of all pet transports and registrations.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-2xl p-5 bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.color }}>
                {c.icon}
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#0D4B4D' }}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transports */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-amber-100 shadow-sm p-5">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#0D4B4D' }}>Recent Transports</h3>
          <div className="space-y-3">
            {(data?.recentTransports || []).map((t: any) => (
              <div key={t.tracking_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-amber-100 flex items-center justify-center text-xl">
                  {t.photo_url ? <img src={t.photo_url} alt={t.pet_name} className="w-full h-full object-cover" /> : speciesEmoji(t.species)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#0D4B4D' }}>
                    {t.pet_name ? `${t.pet_name} (${t.species})` : t.cargo_type}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{t.origin} → {t.destination}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                  {t.is_paused && <span className="block text-xs text-red-500 mt-0.5">⏸ Paused</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Species Breakdown */}
        <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-5">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#0D4B4D' }}>Species in Registry</h3>
          <div className="space-y-3">
            {(data?.speciesBreakdown || []).map((s: any) => (
              <div key={s.species} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{speciesEmoji(s.species)}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium" style={{ color: '#0D4B4D' }}>{s.species}</span>
                    <span className="text-gray-500">{s.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (s.count / Math.max(...(data?.speciesBreakdown || []).map((x: any) => Number(x.count)))) * 100)}%`, background: 'linear-gradient(90deg, #F59E0B, #D97706)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-white border border-amber-100 shadow-sm p-5">
        <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: '#0D4B4D' }}>Recent Notifications</h3>
        <div className="space-y-2">
          {(data?.notifications || []).slice(0, 5).map((n: any) => (
            <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl ${n.is_read ? 'opacity-60' : ''}`}
              style={{ background: n.type === 'warning' ? '#FEF3C7' : n.type === 'success' ? '#D1FAE5' : '#F0FAFA' }}>
              <span className="text-lg">{n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#0D4B4D' }}>{n.title}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
