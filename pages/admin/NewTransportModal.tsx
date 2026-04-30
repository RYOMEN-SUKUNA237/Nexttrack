import React, { useState, useEffect } from 'react';
import { X, Search, Route, Clock, Calendar, Truck, Plane, Zap } from 'lucide-react';
import Select from 'react-select';
import { createTransport } from '../../services/api';
import { geocodeSearch, getRouteWithFallback, formatDistance, formatDuration } from '../../utils/mapbox';
import { speciesEmoji, generateTrackingId } from './types';

interface Option { label: string; value: string; extra?: any; }

const PET_TYPES = [
  'Dog', 'Cat', 'Bird', 'Reptile', 'Fish', 'Small Mammal', 'Horse', 'Exotic', 'Other'
];

interface NewTransportModalProps {
  pets: any[];
  handlers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const NewTransportModal: React.FC<NewTransportModalProps> = ({ pets, handlers, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [petId, setPetId] = useState('');
  const [cargoType, setCargoType] = useState('Dog');
  const [customCargoType, setCustomCargoType] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [weight, setWeight] = useState('');
  const [courierId, setCourierId] = useState('');

  // Location State
  const [origin, setOrigin] = useState<{ name: string; lng: number; lat: number } | null>(null);
  const [dest, setDest] = useState<{ name: string; lng: number; lat: number } | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originResults, setOriginResults] = useState<any[]>([]);
  const [destResults, setDestResults] = useState<any[]>([]);
  
  // Routing / Simulation State
  const [simulating, setSimulating] = useState(false);
  const [routeBase, setRouteBase] = useState<{ distance: number; duration: number } | null>(null);
  const [chains, setChains] = useState<any[]>([]);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [arrivalDate, setArrivalDate] = useState('');

  // Pet Options for react-select
  const petOptions: Option[] = pets.map(p => ({
    label: `${speciesEmoji(p.species)} ${p.name} (${p.pet_id}) — ${p.owner_name || 'No owner'}`,
    value: p.pet_id,
    extra: p
  }));

  // Fetch location results
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (originQuery && (!origin || origin.name !== originQuery)) {
        const res = await geocodeSearch(originQuery);
        setOriginResults(res);
      } else {
        setOriginResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [originQuery, origin]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destQuery && (!dest || dest.name !== destQuery)) {
        const res = await geocodeSearch(destQuery);
        setDestResults(res);
      } else {
        setDestResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [destQuery, dest]);

  const simulateRoute = async () => {
    if (!origin || !dest) return setError('Please select both Origin and Destination from the dropdown.');
    setSimulating(true); setError('');
    try {
      const res = await getRouteWithFallback([origin.lng, origin.lat], [dest.lng, dest.lat]);
      if (res) {
        setRouteBase({ distance: res.distance, duration: res.duration });
        // Generate 3 chains
        setChains([
          { id: 1, type: 'Fastest', modes: ['Air Freight', 'Priority Ground'], icon: <Zap size={18} className="text-amber-500" />, timeFactor: 0.6, priceFactor: 2.0 },
          { id: 2, type: 'Average', modes: ['Express Trucking'], icon: <Plane size={18} className="text-blue-500" />, timeFactor: 1.0, priceFactor: 1.0 },
          { id: 3, type: 'Slowest', modes: ['Consolidated Ground'], icon: <Truck size={18} className="text-gray-500" />, timeFactor: 1.5, priceFactor: 0.6 },
        ]);
        setSelectedChain(0); // auto-select fastest
      } else {
        setError('Could not calculate route between these locations.');
      }
    } catch (err: any) {
      setError(err.message || 'Route simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  const handleCreate = async () => {
    if (!origin || !dest || !senderName || !receiverName) {
      return setError('Origin, destination, and sender/receiver names are required.');
    }
    if (!selectedChain && selectedChain !== 0) {
      return setError('Please simulate and select a transport chain.');
    }
    
    setSaving(true); setError('');
    try {
      const chain = chains[selectedChain];
      const finalDuration = (routeBase?.duration || 0) * chain.timeFactor;
      
      let estDelivery = arrivalDate;
      if (!estDelivery) {
        estDelivery = new Date(Date.now() + finalDuration * 1000).toISOString().slice(0, 16);
      }

      const finalCargoType = cargoType === 'Other' ? customCargoType : cargoType;

      await createTransport({
        tracking_id: generateTrackingId(),
        pet_id: petId || undefined,
        sender_name: senderName,
        sender_email: senderEmail,
        receiver_name: receiverName,
        receiver_email: receiverEmail,
        origin: origin.name,
        origin_lng: origin.lng,
        origin_lat: origin.lat,
        destination: dest.name,
        dest_lng: dest.lng,
        dest_lat: dest.lat,
        transport_type: chain.type === 'Fastest' ? 'air' : 'road',
        cargo_type: finalCargoType,
        weight: weight || null,
        courier_id: courierId || undefined,
        estimated_delivery: estDelivery,
        route_distance: routeBase?.distance,
        route_duration: finalDuration,
        transport_modes: chain.modes,
      });
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to create.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-100 flex-shrink-0">
          <h3 className="text-lg font-bold" style={{ color: '#0D4B4D' }}>🚚 Advanced Transport Creation</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {error && <div className="col-span-1 md:col-span-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          {/* Left Column: Basic Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-700 border-b pb-2">1. Pet & Client Information</h4>
            
            {/* Pet Link Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Search & Link Pet (Optional)</label>
              <Select
                options={petOptions}
                isClearable
                placeholder="Search registered pets..."
                onChange={(opt: any) => {
                  setPetId(opt?.value || '');
                  if (opt?.extra) {
                    setSenderName(opt.extra.owner_name || '');
                    setSenderEmail(opt.extra.owner_email || '');
                  }
                }}
                className="text-sm"
              />
            </div>

            {/* Pet Type Selection */}
            {!petId && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pet Type</label>
                  <select value={cargoType} onChange={e => setCargoType(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none bg-white">
                    {PET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {cargoType === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Specify Type</label>
                    <input value={customCargoType} onChange={e => setCustomCargoType(e.target.value)} placeholder="e.g. Fennec Fox"
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sender Name *</label>
                <input value={senderName} onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sender Email</label>
                <input value={senderEmail} onChange={e => setSenderEmail(e.target.value)} type="email"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Receiver Name *</label>
                <input value={receiverName} onChange={e => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Receiver Email</label>
                <input value={receiverEmail} onChange={e => setReceiverEmail(e.target.value)} type="email"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Weight (kg)</label>
                <input value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.1"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assign Handler</label>
                <select value={courierId} onChange={e => setCourierId(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none bg-white">
                  <option value="">— Assign later —</option>
                  {handlers.map(h => <option key={h.id} value={h.courier_id}>{h.name} ({h.vehicle_type})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Routing & Logistics */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-700 border-b pb-2">2. Logistics & Routing</h4>
            
            {/* Origin Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Origin *</label>
              <input value={originQuery} onChange={e => { setOriginQuery(e.target.value); setOrigin(null); }}
                placeholder="Search origin city/address..."
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              {originResults.length > 0 && !origin && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-lg max-h-48 overflow-y-auto">
                  {originResults.map((r, i) => (
                    <div key={i} onClick={() => { setOrigin({ name: r.place_name, lng: r.lng, lat: r.lat }); setOriginQuery(r.place_name); setOriginResults([]); }}
                      className="px-4 py-2 text-sm hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-0">{r.place_name}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Destination *</label>
              <input value={destQuery} onChange={e => { setDestQuery(e.target.value); setDest(null); }}
                placeholder="Search destination city/address..."
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
              {destResults.length > 0 && !dest && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-lg max-h-48 overflow-y-auto">
                  {destResults.map((r, i) => (
                    <div key={i} onClick={() => { setDest({ name: r.place_name, lng: r.lng, lat: r.lat }); setDestQuery(r.place_name); setDestResults([]); }}
                      className="px-4 py-2 text-sm hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-0">{r.place_name}</div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={simulateRoute} disabled={simulating || !origin || !dest}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0a192f] text-white font-semibold rounded-xl text-sm shadow hover:bg-[#112d57] transition-colors disabled:opacity-50">
              {simulating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Route size={16} />}
              Simulate Route & Transport Chains
            </button>

            {/* Simulated Chains */}
            {chains.length > 0 && routeBase && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Base Route: {formatDistance(routeBase.distance)}</p>
                <div className="grid grid-cols-1 gap-2">
                  {chains.map((chain, i) => {
                    const estDur = routeBase.duration * chain.timeFactor;
                    return (
                      <div key={chain.id} onClick={() => setSelectedChain(i)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedChain === i ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-amber-300 bg-white'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {chain.icon}
                            <div>
                              <p className="font-bold text-sm text-[#0D4B4D]">{chain.type} Chain</p>
                              <p className="text-xs text-gray-500">{chain.modes.join(' + ')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-gray-700">{formatDuration(estDur)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Target Arrival Date/Time (Optional)</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <input type="datetime-local" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm focus:border-amber-400 outline-none" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">If provided, the system will use the selected chain to aim for this arrival.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-amber-100 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleCreate} disabled={saving || (!selectedChain && selectedChain !== 0)}
            className="px-6 py-2 text-white font-semibold rounded-xl text-sm shadow-md disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            {saving ? 'Creating...' : 'Initialize Transport'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTransportModal;
