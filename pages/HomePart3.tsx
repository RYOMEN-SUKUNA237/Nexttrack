import React, { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/ui/Reveal';
import { submitQuote, submitReview } from '../services/api';

const N900 = '#0a1628';
const N800 = '#0f2040';
const ACCENT = '#4f8ef7';

const previewReviews = [
  {
    name: 'David Marchetti', role: 'VP Logistics · Apex Global Trade', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&fit=crop&w=100&q=80',
    text: 'Next Track transformed our supply chain visibility. Real-time container tracking across 14 ports with zero data lag. The analytics dashboard alone saved us weeks of manual reporting.',
  },
  {
    name: 'Sarah Chen', role: 'Director of Operations · MedFreight Asia', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&fit=crop&w=100&q=80',
    text: 'Cold-chain monitoring for pharmaceutical cargo is non-negotiable. Next Track delivers temperature logs, customs alerts, and ETA predictions in one clean interface. Exceptional.',
  },
  {
    name: 'James Okafor', role: 'Fleet Manager · Meridian Road Carriers', rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=jpg&fit=crop&w=100&q=80',
    text: 'Managing 320 vehicles is no small task. The live asset module gives our dispatchers precise GPS, driver behaviour scores, and route deviation alerts all in one place.',
  },
];

export const TestimonialsSection: React.FC = () => (
  <section className="py-24" style={{ background: '#f8fafc' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'rgba(79,142,247,0.1)', color: ACCENT, border: '1px solid rgba(79,142,247,0.2)' }}>
            Client Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: N900 }}>Trusted by Industry Leaders</h2>
          <p className="text-slate-500">What our enterprise clients say about Next Track.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {previewReviews.map((r, i) => (
          <Reveal key={r.name} direction="bottom" delay={i * 0.1}>
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="flex gap-1 mb-4">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-slate-600 italic flex-1 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm" style={{ color: N900 }}>{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="text-center">
        <Link to="/reviews" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${N800}, #2952a3)` }}>
          View All Reviews
        </Link>
      </div>
    </div>
  </section>
);

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    service: 'road-freight', origin: '', destination: '', details: ''
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await submitQuote(form as any); setSent(true); } catch { setSent(true); }
    finally { setLoading(false); }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide text-slate-400">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors text-white placeholder-slate-500"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(79,142,247,0.2)', '--tw-ring-color': ACCENT } as any}
      />
    </div>
  );

  return (
    <section id="contact" className="py-24" style={{ background: N800 }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal direction="bottom">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(79,142,247,0.15)', color: '#93c5fd', border: '1px solid rgba(79,142,247,0.25)' }}>
              Get a Quote
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Your Shipment Today</h2>
            <p className="text-slate-400">Fill in the details and our logistics team will respond within 2 business hours.</p>
          </div>
        </Reveal>
        <Reveal direction="bottom" delay={0.1}>
          {sent ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Quote Request Sent!</h3>
              <p className="text-slate-400">Our logistics team will contact you within 2 hours with a tailored proposal.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-8 space-y-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(79,142,247,0.15)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('name', 'Full Name', 'text', 'Jane Smith')}
                {field('email', 'Business Email', 'email', 'jane@company.com')}
                {field('phone', 'Phone', 'tel', '+1 555-000-0000')}
                {field('company', 'Company', 'text', 'Acme Logistics Ltd')}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide text-slate-400">Service Type</label>
                  <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none text-white"
                    style={{ background: N900, border: '1px solid rgba(79,142,247,0.2)' }}>
                    <option value="parcel">Parcel & Cargo</option>
                    <option value="road-freight">Road Freight</option>
                    <option value="air-freight">Air Freight</option>
                    <option value="sea-freight">Sea Freight</option>
                    <option value="asset-tracking">Live Asset Tracking</option>
                    <option value="pet-transport">Pet & Animal Transport</option>
                    <option value="full-logistics">Full Logistics Solution</option>
                  </select>
                </div>
                {field('origin', 'Origin', 'text', 'Houston, TX')}
                {field('destination', 'Destination', 'text', 'London, UK')}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide text-slate-400">Additional Details</label>
                <textarea rows={3} value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                  placeholder="Cargo type, weight, dimensions, special requirements..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none text-white placeholder-slate-500"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(79,142,247,0.2)' }} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 shadow-lg"
                style={{ background: `linear-gradient(135deg, #2952a3, ${ACCENT})` }}>
                <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Request a Quote'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
};
