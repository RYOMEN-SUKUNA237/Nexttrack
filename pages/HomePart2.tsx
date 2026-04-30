import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, ChevronDown, ChevronUp, Heart, Shield, Clock, Award, PawPrint } from 'lucide-react';
import Reveal from '../components/ui/Reveal';

/* ── TRACK SECTION ────────────────────────────────────────── */
export const TrackSection: React.FC = () => {
  const [trackId, setTrackId] = useState('');
  const navigate = useNavigate();
  const handleTrack = () => { if (trackId.trim()) navigate(`/track/${trackId.trim()}`); };

  return (
    <section id="track" className="py-20 overflow-hidden" style={{ background: '#0D4B4D' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Reveal direction="bottom">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
            <PawPrint className="w-3.5 h-3.5" /> Real-Time Pet Tracking
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Know Where Your Pet Is — Always
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Enter your tracking ID to see live location, wellness status, comfort checks, and full journey history.
          </p>
          <form onSubmit={e => { e.preventDefault(); handleTrack(); }} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input type="text" value={trackId} onChange={e => setTrackId(e.target.value)}
              placeholder="Enter tracking ID (e.g. PT-8842-X9)"
              className="flex-1 h-14 px-5 rounded-xl text-sm font-mono outline-none"
              style={{ background: 'rgba(255,248,237,0.1)', border: '1.5px solid rgba(245,158,11,0.4)', color: 'white' }}
            />
            <button type="submit" className="h-14 px-8 rounded-xl font-semibold text-white flex items-center gap-2 justify-center"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <Search className="w-4 h-4" /> Track Pet
            </button>
          </form>
          <p className="text-xs mt-4" style={{ color: '#6B9999' }}>
            Try demo: <button onClick={() => navigate('/track/PT-8842-X9')} className="underline hover:text-amber-400 transition-colors">PT-8842-X9</button>
          </p>
        </Reveal>

        {/* Status demo steps */}
        <Reveal direction="bottom" delay={0.2}>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Booked', done: true },
              { label: 'Picked Up', done: true },
              { label: 'In Transit', done: true },
              { label: 'Comfort Check', done: false },
              { label: 'Delivered', done: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${step.done ? 'text-white' : 'text-gray-500'}`}
                  style={{ background: step.done ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255,255,255,0.1)' }}>
                  {step.done ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <p className="text-xs font-medium" style={{ color: step.done ? '#FCD34D' : '#6B9999' }}>{step.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── WHY US ───────────────────────────────────────────────── */
const whyUs = [
  { icon: <Shield className="w-7 h-7" />, title: 'Certified Handlers', desc: 'Every handler is IATA LAR, USDA, and species-specific certified with background checks.' },
  { icon: <Heart className="w-7 h-7" />, title: 'Wellness Monitoring', desc: 'Comfort checks every 2 hours with feeding logs, health notes, and instant owner alerts.' },
  { icon: <Clock className="w-7 h-7" />, title: '24/7 Vet On-Call', desc: 'Licensed veterinarians available around the clock for any health concerns during transport.' },
  { icon: <Award className="w-7 h-7" />, title: '99.9% Safe Arrivals', desc: 'Over 50,000 pets transported with an industry-leading safety and satisfaction record.' },
];

export const WhyUsSection: React.FC = () => (
  <section id="why-us" className="py-20" style={{ background: '#FFF8ED' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: '#FEF3C7', color: '#D97706' }}>
            Why PawTrack
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0D4B4D' }}>Your Pet Deserves the Best Care</h2>
          <p className="text-gray-500 max-w-xl mx-auto">We go beyond shipping — we care for your pet as if it were our own.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {whyUs.map((w, i) => (
          <Reveal key={w.title} direction="bottom" delay={i * 0.1}>
            <div className="p-6 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border border-amber-100 bg-white">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                {w.icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#0D4B4D' }}>{w.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── FAQ ──────────────────────────────────────────────────── */
const faqs = [
  { q: 'How do I track my pet?', a: 'Enter your unique tracking ID (format: PT-XXXX-XX) in the Track section. You\'ll see real-time location, wellness status, comfort check logs, and the full journey history.' },
  { q: 'What species do you transport?', a: 'We handle dogs, cats, horses, birds (all species), reptiles, small mammals, fish/amphibians, and livestock. If you have an unusual species, contact us and our team will assess the requirements.' },
  { q: 'What is a "comfort check"?', a: 'Every 2 hours our handler performs a wellness check — assessing the pet\'s behavior, feeding, hydration, temperature, and general comfort. Results are logged and visible on the tracking dashboard.' },
  { q: 'Can transport be paused?', a: 'Yes. Transport can be paused for vet holds, weather delays, quarantine requirements, documentation issues, or scheduled comfort stops. You\'ll be notified immediately with the reason.' },
  { q: 'Do you handle international transport?', a: 'Absolutely. We manage IATA, CITES, USDA, and destination-country documentation. Our team coordinates with airlines, shipping lines, and customs authorities worldwide.' },
  { q: 'What vaccinations does my pet need?', a: 'Requirements vary by species and destination. Our team will provide a species-specific checklist and can coordinate with your vet to ensure all certificates are complete before transport.' },
];

export const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20" style={{ background: '#F0FAFA' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal direction="bottom">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'rgba(13,75,77,0.08)', color: '#0D4B4D' }}>
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#0D4B4D' }}>Frequently Asked Questions</h2>
          </div>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={i} direction="bottom" delay={i * 0.05}>
              <div className="rounded-2xl overflow-hidden bg-white border border-amber-100 shadow-sm">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-amber-50 transition-colors">
                  <span className="font-semibold text-sm pr-4" style={{ color: '#0D4B4D' }}>{f.q}</span>
                  {open === i ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                              : <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400" />}
                </button>
                {open === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-amber-50 pt-3">{f.a}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
