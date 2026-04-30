import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Reveal from '../components/ui/Reveal';
import {
  Search, PawPrint, Heart, Shield, Clock, CheckCircle, Star,
  ArrowRight, ChevronDown, ChevronUp, Send, Plane, Truck, Ship,
  Thermometer, Activity, MapPin, Award, Users
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN, initMapbox, getRouteWithFallback, interpolateAlongRoute, ROUTE_STYLE } from '../utils/mapbox';

/* ── HERO ────────────────────────────────────────────────────────── */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');
  const handleTrack = () => { if (trackId.trim()) navigate(`/track/${trackId.trim()}`); };
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?fm=jpg&fit=crop&w=2000&q=80"
          alt="Happy dog on journey" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,75,77,0.92) 0%, rgba(13,75,77,0.75) 50%, rgba(13,75,77,0.4) 100%)' }} />
        {/* Paw print watermarks */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23FCD34D'%3E%3Cpath d='M4.5 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm15 5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM9 9.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 8c-3.35 0-6 2.57-6 5.5V15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2c0-2.93-2.65-5.5-6-5.5z'/%3E%3C/svg%3E\")", backgroundSize: '80px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal direction="left" delay={0.2} width="100%">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
                style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
                <PawPrint className="w-3.5 h-3.5" /> Trusted by 10,000+ Pet Families Worldwide
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                Your Pet's Journey,{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}>
                  Tracked with Love.
                </span>
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
                Real-time GPS tracking, wellness monitoring, and certified handlers for every species —
                dogs, cats, horses, birds, reptiles, and more. Safe. Humane. Transparent.
              </p>

              {/* Quick Track Bar */}
              <form onSubmit={e => { e.preventDefault(); handleTrack(); }} className="flex gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#F59E0B' }} />
                  <input type="text" value={trackId} onChange={e => setTrackId(e.target.value)}
                    placeholder="Enter pet tracking ID (e.g. PT-8842-X9)"
                    className="w-full h-14 pl-12 pr-4 rounded-xl text-sm font-mono outline-none"
                    style={{ background: 'rgba(255,248,237,0.12)', border: '1.5px solid rgba(245,158,11,0.5)', color: 'white', backdropFilter: 'blur(8px)' }}
                  />
                </div>
                <button type="submit" className="h-14 px-6 rounded-xl font-semibold text-white whitespace-nowrap shadow-lg transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                  Track Now
                </button>
              </form>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                {[['50+', 'Species Handled'],['99.9%', 'Safe Deliveries'],['24/7', 'Wellness Watch']].map(([n, l]) => (
                  <div key={l}><p className="text-2xl sm:text-3xl font-bold text-white">{n}</p><p className="text-xs text-gray-400">{l}</p></div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.5} className="hidden lg:block">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?fm=jpg&fit=crop&w=700&q=80"
                alt="Dog in transport" className="w-full h-[480px] object-cover rounded-2xl shadow-2xl" />
              {/* Live badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(13,75,77,0.9)', border: '1px solid rgba(245,158,11,0.4)', color: '#FCD34D' }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Tracking Active
              </div>
              {/* Wellness card */}
              <div className="absolute -bottom-6 -right-4 p-4 rounded-2xl shadow-2xl"
                style={{ background: '#FFF8ED', border: '2px solid #FCD34D' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                    <Heart className="w-6 h-6" style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#0D4B4D' }}>Buddy is Comfortable ✓</p>
                    <p className="text-xs" style={{ color: '#78716C' }}>Last check: 12 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ── PET TYPES ───────────────────────────────────────────────────── */
const petTypes = [
  { name: 'Dogs', emoji: '🐕', count: '15+ breeds', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?fm=jpg&fit=crop&w=400&q=80', desc: 'All sizes, temperaments, and breeds. USDA-compliant crates and comfort stops.' },
  { name: 'Cats', emoji: '🐈', count: '12+ breeds', img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?fm=jpg&fit=crop&w=400&q=80', desc: 'Stress-minimized transport with familiar-scent carriers and quiet environments.' },
  { name: 'Horses', emoji: '🐎', count: 'Equine Specialist', img: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?fm=jpg&fit=crop&w=400&q=80', desc: 'Climate-controlled horse trailers, exercise stops, and equine veterinary support.' },
  { name: 'Birds', emoji: '🦜', count: 'All species', img: 'https://images.unsplash.com/photo-1544923246-77307dd270b1?fm=jpg&fit=crop&w=400&q=80', desc: 'CITES-compliant transport for parrots, finches, raptors, and exotic birds.' },
  { name: 'Reptiles', emoji: '🦎', count: 'Exotics welcome', img: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?fm=jpg&fit=crop&w=400&q=80', desc: 'Temperature-regulated transport with heat packs for snakes, lizards, and tortoises.' },
  { name: 'Small Mammals', emoji: '🐰', count: 'Rabbits, ferrets & more', img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?fm=jpg&fit=crop&w=400&q=80', desc: 'Calm, stress-free environments for rabbits, guinea pigs, ferrets, and hamsters.' },
  { name: 'Marine & Aquatic', emoji: '🐠', count: 'Fish & amphibians', img: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?fm=jpg&fit=crop&w=400&q=80', desc: 'Oxygen-infused bags, water quality monitoring, and rapid-transit containers.' },
  { name: 'Livestock', emoji: '🐄', count: 'Farm animals', img: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?fm=jpg&fit=crop&w=400&q=80', desc: 'USDA-compliant livestock transport with feed, water, and veterinary inspection.' },
];

const PetTypesSection: React.FC = () => (
  <section id="pet-types" className="py-20 overflow-hidden" style={{ background: '#FFF8ED' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: '#FEF3C7', color: '#D97706' }}>
            <PawPrint className="w-3 h-3" /> All Species Welcome
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0D4B4D' }}>
            We Transport Every Type of Pet
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From beloved family dogs to exotic reptiles — our specialized handlers are trained and certified for every species.
          </p>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {petTypes.map((pt, i) => (
          <Reveal key={pt.name} direction="bottom" delay={i * 0.07}>
            <div className="group relative overflow-hidden rounded-2xl cursor-pointer h-52 sm:h-64 shadow-md hover:shadow-xl transition-all duration-500">
              <img src={pt.img} alt={pt.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 transition-all duration-500" style={{ background: 'linear-gradient(to top, rgba(13,75,77,0.92) 0%, rgba(13,75,77,0.4) 60%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-2xl mb-1">{pt.emoji}</div>
                <h3 className="font-bold text-white text-base">{pt.name}</h3>
                <p className="text-xs text-amber-300 font-medium">{pt.count}</p>
                <p className="text-xs text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-snug">{pt.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── SERVICES ─────────────────────────────────────────────────────── */
const services = [
  { slug: 'pet-air', icon: <Plane className="w-7 h-7" />, title: 'Air Pet Transport', img: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?fm=jpg&fit=crop&w=600&q=80', desc: 'IATA LAR-certified air cargo for domestic & international pet relocation. Cabin or cargo hold options.', features: ['IATA Compliant Crates', 'Vet Health Certificate Assistance', 'Airline Coordination', 'Climate-Controlled Holds'] },
  { slug: 'pet-road', icon: <Truck className="w-7 h-7" />, title: 'Road Pet Transport', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?fm=jpg&fit=crop&w=600&q=80', desc: 'Door-to-door climate-controlled pet transport vans with regular comfort stops and GPS tracking.', features: ['Door-to-Door Service', 'Climate-Controlled Vans', 'Comfort Stops Every 4h', 'Live GPS Tracking'] },
  { slug: 'pet-sea', icon: <Ship className="w-7 h-7" />, title: 'International Sea Freight', img: 'https://images.unsplash.com/photo-1524522173746-f628baad3644?fm=jpg&fit=crop&w=600&q=80', desc: 'Ocean freight for larger animals and livestock with full CITES and USDA documentation support.', features: ['CITES Documentation', 'Livestock Containers', 'Veterinary Oversight', 'Customs Brokerage'] },
  { slug: 'pet-wellness', icon: <Activity className="w-7 h-7" />, title: 'Wellness Monitoring', img: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?fm=jpg&fit=crop&w=600&q=80', desc: '24/7 real-time health monitoring with comfort checks, feeding logs, and vet on-call support.', features: ['2-Hour Comfort Checks', 'Feeding & Water Logs', 'Vet On-Call 24/7', 'Owner Update Alerts'] },
  { slug: 'pet-relocation', icon: <MapPin className="w-7 h-7" />, title: 'Full Pet Relocation', img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?fm=jpg&fit=crop&w=600&q=80', desc: 'End-to-end international pet relocation — paperwork, transport, customs, quarantine management.', features: ['Documentation Handling', 'Quarantine Management', 'Destination Vet Referral', 'Post-Arrival Support'] },
  { slug: 'other-cargo', icon: <PawPrint className="w-7 h-7" />, title: 'Other Cargo & Parcels', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?fm=jpg&fit=crop&w=600&q=80', desc: 'Standard parcel and cargo shipping for pet supplies, food, accessories, and equipment.', features: ['Express Delivery', 'Parcel Tracking', 'Pet Supplies Shipping', 'Fragile Item Handling'] },
];

const ServicesSection: React.FC = () => (
  <section id="services" className="py-20 overflow-hidden" style={{ background: '#F0FAFA' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'rgba(13,75,77,0.08)', color: '#0D4B4D' }}>
            What We Offer
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0D4B4D' }}>Comprehensive Pet Transport Services</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Every transport mode, every species, handled with professional care.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc, i) => (
          <Reveal key={svc.slug} direction="bottom" delay={i * 0.08}>
            <Link to={`/services/${svc.slug}`} className="block group h-full">
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-amber-100">
                <div className="relative h-44 overflow-hidden">
                  <img src={svc.img} alt={svc.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,75,77,0.5), transparent)' }} />
                  <div className="absolute bottom-4 left-4 w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                    {svc.icon}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-amber-600 transition-colors" style={{ color: '#0D4B4D' }}>{svc.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{svc.desc}</p>
                  <ul className="space-y-1.5 mb-4">
                    {svc.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#F59E0B' }} />{f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: '#F59E0B' }}>
                    Learn More <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export { HeroSection, PetTypesSection, ServicesSection };
