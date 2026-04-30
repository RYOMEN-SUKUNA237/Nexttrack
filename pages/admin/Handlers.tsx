import React, { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Search, X, Edit2, Trash2, Star, Shield } from 'lucide-react';
import { listHandlers, createHandler, updateHandler, deleteHandler } from '../../services/api';
import { SPECIES_LIST, speciesEmoji } from './types';

const STATUS_LIST = ['active', 'inactive', 'on-delivery', 'on-break'];
const VEHICLE_LIST = ['Van', 'Truck', 'SUV', 'Motorcycle', 'Aircraft', 'Ship', 'Specialized Pet Transport'];

const EMPTY: any = {
  name: '', email: '', phone: '', vehicle_type: 'Van', license_plate: '',
  zone: '', status: 'active', specialization: '', certified_species: '',
};

const statusStyle: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  'on-delivery': 'bg-amber-100 text-amber-700',
  'on-break': 'bg-blue-100 text-blue-700',
};

const Handlers: React.FC = () => {
  const [handlers, setHandlers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '200' };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search) params.search = search;
      const res = await listHandlers(params);
      setHandlers(res.couriers || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setShowModal(true); };
  const openEdit = (h: any) => {
    setForm({
      name: h.name || '', email: h.email || '', phone: h.phone || '',
      vehicle_type: h.vehicle_type || 'Van', license_plate: h.license_plate || '',
      zone: h.zone || '', status: h.status || 'active',
      specialization: h.specialization || '', certified_species: h.certified_species || '',
    });
    setEditing(h); setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await updateHandler(editing.id.toString(), form);
      else await createHandler(form);
      setShowModal(false); fetch();
    } catch (e: any) { setError(e.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (h: any) => {
    if (!confirm(`Remove handler ${h.name}?`)) return;
    try { await deleteHandler(h.id.toString()); fetch(); } catch (e: any) { alert(e.message); }
  };

  const inp = (label: string, key: string, type = 'text', options?: string[]) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {options ? (
        <select value={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none bg-white">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#0D4B4D' }}>🧑‍⚕️ Pet Handlers</h2>
          <p className="text-sm text-gray-500">{handlers.length} registered handlers</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
          <Plus size={16} /> Add Handler
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search handlers..."
            className="w-full pl-9 pr-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:border-amber-400 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-amber-200 rounded-xl text-sm outline-none bg-white">
          <option value="all">All Status</option>
          {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center h-48 items-center">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : handlers.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🧑‍⚕️</span>
          <p className="mt-4 text-gray-500">No handlers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {handlers.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={h.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name)}&background=F59E0B&color=fff&size=80`}
                    alt={h.name} className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-bold" style={{ color: '#0D4B4D' }}>{h.name}</p>
                    <p className="text-xs text-gray-400">{h.courier_id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle[h.status] || 'bg-gray-100 text-gray-500'}`}>
                  {h.status}
                </span>
              </div>

              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle</span>
                  <span className="font-medium text-xs" style={{ color: '#0D4B4D' }}>{h.vehicle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zone</span>
                  <span className="font-medium text-xs" style={{ color: '#0D4B4D' }}>{h.zone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deliveries</span>
                  <span className="font-medium text-xs" style={{ color: '#0D4B4D' }}>{h.total_deliveries ?? 0}</span>
                </div>
                {h.certified_species && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">Certified</span>
                    <span className="text-xs text-right font-medium text-teal-700">{h.certified_species}</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} className={i <= Math.round(Number(h.rating) || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                ))}
                <span className="text-xs text-gray-400 ml-1">{Number(h.rating || 0).toFixed(1)}</span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-amber-50">
                <button onClick={() => openEdit(h)}
                  className="flex-1 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(h)}
                  className="flex-1 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <h3 className="text-lg font-bold" style={{ color: '#0D4B4D' }}>
                {editing ? 'Edit Handler' : '🧑‍⚕️ Add Pet Handler'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4">
              {error && <div className="col-span-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
              {inp('Full Name *', 'name')}
              {inp('Email *', 'email', 'email')}
              {inp('Phone', 'phone', 'tel')}
              {inp('Vehicle Type', 'vehicle_type', 'text', VEHICLE_LIST)}
              {inp('License Plate', 'license_plate')}
              {inp('Assigned Zone / Route', 'zone')}
              {inp('Status', 'status', 'text', STATUS_LIST)}
              {inp('Specialization', 'specialization')}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Certified Species</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIES_LIST.map(s => (
                    <button key={s} type="button"
                      onClick={() => {
                        const current = form.certified_species ? form.certified_species.split(',').map((x: string) => x.trim()).filter(Boolean) : [];
                        const next = current.includes(s) ? current.filter((x: string) => x !== s) : [...current, s];
                        setForm((p: any) => ({ ...p, certified_species: next.join(', ') }));
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        form.certified_species?.includes(s)
                          ? 'bg-amber-400 text-white border-amber-400'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'
                      }`}>
                      {speciesEmoji(s)} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-amber-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 text-white font-semibold rounded-xl text-sm shadow-md disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Handler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Handlers;
