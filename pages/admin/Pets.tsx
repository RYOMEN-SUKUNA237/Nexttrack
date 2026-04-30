import React, { useEffect, useState, useCallback } from 'react';
import { PawPrint, Plus, Search, X, Edit2, Trash2, Eye, ChevronDown, Heart, Shield, AlertTriangle } from 'lucide-react';
import { listPets, createPet, updatePet, deletePet } from '../../services/api';
import {
  Pet, SPECIES_LIST, HEALTH_STATUS_LIST, VACCINATION_STATUS_LIST,
  speciesEmoji, healthColor, generatePetId
} from './types';

const EMPTY_PET = {
  name: '', species: 'Dog', breed: '', age: '', weight: '', color: '', gender: 'Male',
  microchip_id: '', vaccination_status: 'unknown', vaccination_notes: '',
  health_status: 'unknown', health_notes: '', temperament: '', diet_info: '',
  special_needs: '', crate_type: '', crate_size: '', owner_name: '', owner_email: '',
  owner_phone: '', vet_name: '', vet_phone: '', vet_clearance: false, photo_url: '',
};

const Pets: React.FC = () => {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [viewPet, setViewPet] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_PET);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'basic' | 'health' | 'owner' | 'transport'>('basic');

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '200' };
      if (filterSpecies !== 'all') params.species = filterSpecies;
      if (filterHealth !== 'all') params.health_status = filterHealth;
      if (search) params.search = search;
      const res = await listPets(params);
      setPets(res.pets || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterSpecies, filterHealth, search]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  const openAdd = () => { setForm(EMPTY_PET); setEditingPet(null); setError(''); setTab('basic'); setShowModal(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name || '', species: p.species || 'Dog', breed: p.breed || '', age: p.age || '',
      weight: p.weight || '', color: p.color || '', gender: p.gender || 'Male',
      microchip_id: p.microchip_id || '', vaccination_status: p.vaccination_status || 'unknown',
      vaccination_notes: p.vaccination_notes || '', health_status: p.health_status || 'unknown',
      health_notes: p.health_notes || '', temperament: p.temperament || '', diet_info: p.diet_info || '',
      special_needs: p.special_needs || '', crate_type: p.crate_type || '', crate_size: p.crate_size || '',
      owner_name: p.owner_name || '', owner_email: p.owner_email || '', owner_phone: p.owner_phone || '',
      vet_name: p.vet_name || '', vet_phone: p.vet_phone || '', vet_clearance: p.vet_clearance || false,
      photo_url: p.photo_url || '',
    });
    setEditingPet(p); setError(''); setTab('basic'); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.species) { setError('Name and species are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editingPet) { await updatePet(editingPet.id.toString(), form); }
      else { await createPet(form); }
      setShowModal(false); fetchPets();
    } catch (e: any) { setError(e.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try { await deletePet(p.id.toString()); fetchPets(); } catch (e: any) { alert(e.message); }
  };

  const field = (label: string, key: string, type = 'text', opts?: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {opts?.options ? (
        <select value={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none bg-white">
          {opts.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          rows={2} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none resize-none" />
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.checked }))}
            className="w-4 h-4 accent-amber-500" />
          <span className="text-sm text-gray-600">Yes</span>
        </label>
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
      )}
    </div>
  );

  const vacColor = (v: string) => ({
    'up-to-date': 'bg-green-100 text-green-700', 'overdue': 'bg-red-100 text-red-700',
    'not-required': 'bg-gray-100 text-gray-600', 'unknown': 'bg-yellow-100 text-yellow-700',
  }[v] || 'bg-gray-100 text-gray-600');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#0D4B4D' }}>🐾 Pet Registry</h2>
          <p className="text-sm text-gray-500">{pets.length} registered pets</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
          <Plus size={16} /> Add Pet
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, breed, ID, owner..."
            className="w-full pl-9 pr-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:border-amber-400 outline-none" />
        </div>
        <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)}
          className="px-3 py-2.5 border border-amber-200 rounded-xl text-sm focus:border-amber-400 outline-none bg-white">
          <option value="all">All Species</option>
          {SPECIES_LIST.map(s => <option key={s} value={s}>{speciesEmoji(s)} {s}</option>)}
        </select>
        <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}
          className="px-3 py-2.5 border border-amber-200 rounded-xl text-sm focus:border-amber-400 outline-none bg-white">
          <option value="all">All Health</option>
          {HEALTH_STATUS_LIST.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <PawPrint className="w-8 h-8 animate-bounce" style={{ color: '#F59E0B' }} />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">🐾</span>
          <p className="mt-4 text-gray-500 font-medium">No pets found</p>
          <p className="text-sm text-gray-400">Add your first pet to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-amber-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-50 border-b border-amber-100">
                {['Pet', 'Species / Breed', 'Health', 'Vaccination', 'Owner', 'Crate', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pets.map((p, i) => (
                <tr key={p.id} className={`border-b border-amber-50 hover:bg-amber-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                        {p.photo_url ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" /> : speciesEmoji(p.species)}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: '#0D4B4D' }}>{p.name}</p>
                        <p className="text-xs text-gray-400">{p.pet_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: '#0D4B4D' }}>{p.species}</p>
                    <p className="text-xs text-gray-400">{p.breed || '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${healthColor(p.health_status)}`}>
                      {p.health_status === 'critical' ? '🚨' : p.health_status === 'monitoring' ? '👁️' : '✅'} {p.health_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${vacColor(p.vaccination_status)}`}>
                      {p.vaccination_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-xs" style={{ color: '#0D4B4D' }}>{p.owner_name || '—'}</p>
                    <p className="text-xs text-gray-400">{p.owner_phone || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.crate_size ? `${p.crate_size} ${p.crate_type || ''}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewPet(p)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#0D4B4D' }}>
                  {editingPet ? `Edit ${editingPet.name}` : '🐾 Register New Pet'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the pet's profile details</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-amber-100 px-6">
              {([['basic', '🐾 Basic'], ['health', '❤️ Health'], ['owner', '👤 Owner'], ['transport', '📦 Transport']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${tab === id ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

              {tab === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  {field('Pet Name *', 'name')}
                  {field('Species *', 'species', 'text', { options: SPECIES_LIST })}
                  {field('Breed', 'breed')}
                  {field('Age', 'age')}
                  {field('Weight (kg)', 'weight')}
                  {field('Color / Markings', 'color')}
                  {field('Gender', 'gender', 'text', { options: ['Male', 'Female', 'Unknown'] })}
                  {field('Microchip ID', 'microchip_id')}
                  <div className="col-span-2">{field('Photo URL', 'photo_url')}</div>
                </div>
              )}
              {tab === 'health' && (
                <div className="grid grid-cols-2 gap-4">
                  {field('Health Status', 'health_status', 'text', { options: HEALTH_STATUS_LIST })}
                  {field('Vaccination Status', 'vaccination_status', 'text', { options: VACCINATION_STATUS_LIST })}
                  <div className="col-span-2">{field('Health Notes', 'health_notes', 'textarea')}</div>
                  <div className="col-span-2">{field('Vaccination Notes', 'vaccination_notes', 'textarea')}</div>
                  {field('Temperament', 'temperament')}
                  {field('Diet / Feeding Info', 'diet_info')}
                  <div className="col-span-2">{field('Special Needs / Allergies', 'special_needs', 'textarea')}</div>
                  {field('Crate Type', 'crate_type', 'text', { options: ['', 'Hard Shell', 'Soft Carrier', 'Wire Crate', 'Custom'] })}
                  {field('Crate Size', 'crate_size', 'text', { options: ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] })}
                  <div className="col-span-2">{field('Vet Clearance Obtained', 'vet_clearance', 'checkbox')}</div>
                </div>
              )}
              {tab === 'owner' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><h4 className="font-semibold text-sm text-gray-600 mb-3">Owner Information</h4></div>
                  {field('Owner Name', 'owner_name')}
                  {field('Owner Email', 'owner_email', 'email')}
                  {field('Owner Phone', 'owner_phone', 'tel')}
                  <div className="col-span-2"><h4 className="font-semibold text-sm text-gray-600 mt-2 mb-3">Veterinarian Information</h4></div>
                  {field('Vet / Clinic Name', 'vet_name')}
                  {field('Vet Phone', 'vet_phone', 'tel')}
                </div>
              )}
              {tab === 'transport' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-1">📦 Transport Info</p>
                    <p className="text-xs text-amber-700">Transport records are created in the <strong>Transports</strong> section and linked to this pet via the Pet ID.</p>
                  </div>
                  {editingPet && (
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 mb-1">Pet ID</p>
                      <p className="text-lg font-mono font-bold" style={{ color: '#0D4B4D' }}>{editingPet.pet_id}</p>
                      <p className="text-xs text-teal-600 mt-1">Use this ID when creating a transport for this pet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-amber-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 shadow-md"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                {saving ? 'Saving...' : editingPet ? 'Save Changes' : 'Register Pet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <h3 className="text-lg font-bold" style={{ color: '#0D4B4D' }}>Pet Profile</h3>
              <button onClick={() => setViewPet(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl overflow-hidden">
                  {viewPet.photo_url ? <img src={viewPet.photo_url} alt={viewPet.name} className="w-full h-full object-cover" /> : speciesEmoji(viewPet.species)}
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: '#0D4B4D' }}>{viewPet.name}</p>
                  <p className="text-sm text-gray-500">{viewPet.species} • {viewPet.breed || 'Unknown breed'}</p>
                  <p className="text-xs font-mono text-amber-600 mt-1">{viewPet.pet_id}</p>
                </div>
              </div>
              {[
                ['Age', viewPet.age], ['Weight', viewPet.weight ? `${viewPet.weight} kg` : null],
                ['Color', viewPet.color], ['Gender', viewPet.gender],
                ['Microchip ID', viewPet.microchip_id], ['Temperament', viewPet.temperament],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium" style={{ color: '#0D4B4D' }}>{value}</span>
                </div>
              ))}
              <hr className="border-amber-100" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Health</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${healthColor(viewPet.health_status)}`}>{viewPet.health_status}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${vacColor(viewPet.vaccination_status)}`}>Vax: {viewPet.vaccination_status}</span>
                  {viewPet.vet_clearance && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅ Vet Cleared</span>}
                </div>
                {viewPet.health_notes && <p className="mt-2 text-sm text-gray-600">{viewPet.health_notes}</p>}
                {viewPet.special_needs && <p className="mt-1 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">⚠️ {viewPet.special_needs}</p>}
              </div>
              <hr className="border-amber-100" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Owner</p>
                {[['Name', viewPet.owner_name], ['Email', viewPet.owner_email], ['Phone', viewPet.owner_phone]].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l as string} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{l}</span><span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
              {(viewPet.vet_name || viewPet.vet_phone) && <>
                <hr className="border-amber-100" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Veterinarian</p>
                  {[['Clinic', viewPet.vet_name], ['Phone', viewPet.vet_phone]].filter(([, v]) => v).map(([l, v]) => (
                    <div key={l as string} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">{l}</span><span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </>}
              {(viewPet.crate_size || viewPet.crate_type) && <>
                <hr className="border-amber-100" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Crate Requirements</p>
                  <p className="text-sm font-medium" style={{ color: '#0D4B4D' }}>{viewPet.crate_size} — {viewPet.crate_type}</p>
                </div>
              </>}
            </div>
            <div className="flex gap-3 p-6 border-t border-amber-100">
              <button onClick={() => { setViewPet(null); openEdit(viewPet); }}
                className="flex-1 py-2 text-sm font-semibold rounded-xl text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>Edit Pet</button>
              <button onClick={() => setViewPet(null)}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pets;
