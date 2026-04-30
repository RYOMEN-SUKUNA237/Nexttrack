import React, { useEffect, useState, useCallback } from 'react';
import { Truck, Plus, Search, X, Edit2, Trash2, Pause, Play, Eye, ChevronDown } from 'lucide-react';
import {
  listTransports, updateTransportStatus,
  pauseTransport, assignHandler, deleteTransport, listHandlers, listPets
} from '../../services/api';
import { Transport, PAUSE_CATEGORIES, speciesEmoji, statusColor } from './types';
import NewTransportModal from './NewTransportModal';

const TRANSPORT_STATUSES = ['pending', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered', 'returned'];
const TRANSPORT_TYPES = ['road', 'air', 'sea'];

const Transports: React.FC = () => {
  const [transports, setTransports] = useState<any[]>([]);
  const [handlers, setHandlers] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [viewTransport, setViewTransport] = useState<any>(null);
  const [showPause, setShowPause] = useState<any>(null);
  const [pauseForm, setPauseForm] = useState({ category: 'Comfort Stop', reason: '' });
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '200' };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search) params.search = search;
      const [tRes, hRes, pRes] = await Promise.all([
        listTransports(params),
        listHandlers({ limit: '200' }),
        listPets({ limit: '500' }),
      ]);
      setTransports(tRes.shipments || []);
      setHandlers(hRes.couriers || []);
      setPets(pRes.pets || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus, search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);



  const handleStatusChange = async (id: string, status: string) => {
    try { await updateTransportStatus(id, { status }); fetchAll(); } catch (e: any) { alert(e.message); }
  };

  const handlePauseToggle = async (t: any) => {
    if (t.is_paused) {
      try { await pauseTransport(t.id.toString(), { action: 'resume' }); fetchAll(); } catch (e: any) { alert(e.message); }
    } else {
      setShowPause(t); setPauseForm({ category: 'Comfort Stop', reason: '' });
    }
  };

  const submitPause = async () => {
    if (!showPause) return;
    try {
      await pauseTransport(showPause.id.toString(), {
        action: 'pause', pause_category: pauseForm.category, pause_reason: pauseForm.reason,
      });
      setShowPause(null); fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const handleAssign = async (transportId: string, courierId: string) => {
    try { await assignHandler(transportId, courierId); fetchAll(); } catch (e: any) { alert(e.message); }
  };

  const handleDelete = async (t: any) => {
    if (!confirm(`Delete transport ${t.tracking_id}?`)) return;
    try { await deleteTransport(t.id.toString()); fetchAll(); } catch (e: any) { alert(e.message); }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#0D4B4D' }}>🚚 Pet Transports</h2>
          <p className="text-sm text-gray-500">{transports.length} transport records</p>
        </div>
        <button onClick={() => { setError(''); setShowAdd(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
          <Plus size={16} /> New Transport
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracking ID, pet, owner..."
            className="w-full pl-9 pr-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:border-amber-400 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-amber-200 rounded-xl text-sm outline-none bg-white">
          <option value="all">All Statuses</option>
          {TRANSPORT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="paused">paused</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transports.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🚚</span>
          <p className="mt-4 text-gray-500">No transports found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-amber-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50 border-b border-amber-100">
                {['Tracking ID', 'Pet', 'Route', 'Status', 'Handler', 'Progress', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transports.map((t, i) => {
                const linkedPet = pets.find(p => p.pet_id === t.pet_id || p.pet_id === t.cargo_type);
                const handler = handlers.find(h => h.courier_id === t.courier_id);
                const progress = t.computed_progress ?? t.progress ?? 0;
                return (
                  <tr key={t.id} className={`border-b border-amber-50 hover:bg-amber-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/20'}`}>
                    <td className="px-4 py-3">
                      <p className="font-mono font-bold text-xs" style={{ color: '#0D4B4D' }}>{t.tracking_id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.transport_type || 'road'}</p>
                      {t.is_paused && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">⏸ Paused</span>}
                    </td>
                    <td className="px-4 py-3">
                      {linkedPet ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{speciesEmoji(linkedPet.species)}</span>
                          <div>
                            <p className="font-semibold text-xs" style={{ color: '#0D4B4D' }}>{linkedPet.name}</p>
                            <p className="text-xs text-gray-400">{linkedPet.species}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">{t.pet_id || t.cargo_type || '—'}</p>
                          <p className="text-xs text-gray-400">{t.sender_name}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: '#0D4B4D' }}>{t.origin}</p>
                      <p className="text-xs text-gray-400">→ {t.destination}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={e => handleStatusChange(t.id.toString(), e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer ${statusColor(t.status)}`}>
                        {TRANSPORT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.courier_id || ''}
                        onChange={e => handleAssign(t.id.toString(), e.target.value)}
                        className="text-xs border border-amber-200 rounded-lg px-2 py-1 focus:border-amber-400 outline-none bg-white max-w-32">
                        <option value="">Unassigned</option>
                        {handlers.map(h => <option key={h.id} value={h.courier_id}>{h.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden min-w-16">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#F59E0B,#0D4B4D)' }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewTransport(t)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"><Eye size={14} /></button>
                        <button onClick={() => handlePauseToggle(t)}
                          className={`p-1.5 rounded-lg transition-colors ${t.is_paused ? 'text-green-600 hover:bg-green-100' : 'text-orange-500 hover:bg-orange-100'}`}>
                          {t.is_paused ? <Play size={14} /> : <Pause size={14} />}
                        </button>
                        <button onClick={() => handleDelete(t)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Transport Modal */}
      {showAdd && (
        <NewTransportModal
          pets={pets}
          handlers={handlers}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchAll(); }}
        />
      )}

      {/* Pause Modal */}
      {showPause && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <h3 className="text-lg font-bold" style={{ color: '#0D4B4D' }}>⏸ Pause Transport</h3>
              <button onClick={() => setShowPause(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Pausing <strong className="text-amber-700">{showPause.tracking_id}</strong></p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pause Category</label>
                <select value={pauseForm.category} onChange={e => setPauseForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none bg-white">
                  {PAUSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason / Notes</label>
                <textarea value={pauseForm.reason} onChange={e => setPauseForm(p => ({ ...p, reason: e.target.value }))}
                  rows={3} placeholder="Describe why the transport is being paused..."
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none resize-none" />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                ⚠️ The owner and receiver will be notified that the transport is paused.
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-amber-100">
              <button onClick={() => setShowPause(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={submitPause}
                className="flex-1 py-2 text-white font-semibold rounded-xl text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTransport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <div>
                <h3 className="text-lg font-bold font-mono" style={{ color: '#0D4B4D' }}>{viewTransport.tracking_id}</h3>
                <p className="text-xs text-gray-400">Transport Record</p>
              </div>
              <button onClick={() => setViewTransport(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(viewTransport.status)}`}>{viewTransport.status}</span>
                {viewTransport.is_paused && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">⏸ Paused: {viewTransport.pause_category}</span>}
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{viewTransport.transport_type}</span>
              </div>

              {viewTransport.pet_id && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-1">Linked Pet ID</p>
                  <p className="font-mono font-bold text-sm" style={{ color: '#0D4B4D' }}>{viewTransport.pet_id}</p>
                </div>
              )}

              {[
                ['From', viewTransport.origin], ['To', viewTransport.destination],
                ['Sender', viewTransport.sender_name], ['Receiver', viewTransport.receiver_name],
                ['ETA', viewTransport.estimated_delivery], ['Weight', viewTransport.weight ? `${viewTransport.weight} kg` : null],
              ].filter(([, v]) => v).map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-sm">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-medium" style={{ color: '#0D4B4D' }}>{v}</span>
                </div>
              ))}

              <div>
                <p className="text-xs text-gray-400 mb-1">Progress</p>
                <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${viewTransport.computed_progress ?? viewTransport.progress ?? 0}%`, background: 'linear-gradient(90deg,#F59E0B,#0D4B4D)' }} />
                </div>
                <p className="text-xs text-right text-gray-400 mt-1">{viewTransport.computed_progress ?? viewTransport.progress ?? 0}%</p>
              </div>

              {viewTransport.pause_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-bold text-red-700">Pause Reason</p>
                  <p className="text-sm text-red-600 mt-1">{viewTransport.pause_reason}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t border-amber-100">
              <button onClick={() => { setViewTransport(null); handlePauseToggle(viewTransport); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl text-white ${viewTransport.is_paused ? 'bg-green-500' : 'bg-orange-500'}`}>
                {viewTransport.is_paused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button onClick={() => setViewTransport(null)}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transports;
