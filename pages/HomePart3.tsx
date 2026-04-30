import React, { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../components/ui/Reveal';
import { submitQuote, submitReview } from '../services/api';

const previewReviews = [
  { name: 'Jennifer Adams', role: 'Dog Owner · Golden Retriever', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&fit=crop&w=100&q=80', text: 'Buddy arrived happy and healthy! The comfort check updates every 2 hours gave me so much peace of mind. Truly exceptional service.', rating: 5 },
  { name: 'Dr. Sarah Lin', role: 'Happy Tails Rescue · Director', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&fit=crop&w=100&q=80', text: 'We use Next Track for all our rescue animal transports. Professional, caring, and the real-time tracking is incredible.', rating: 5 },
  { name: 'Mike Torres', role: 'Equine Breeder · Michigan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&fit=crop&w=100&q=80', text: 'Thunder made the cross-country trip perfectly. The equine specialist handlers were knowledgeable and Thunder arrived calm.', rating: 5 },
];

export const TestimonialsSection: React.FC = () => (
  <section className="py-20" style={{ background: '#FFF8ED' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <Reveal direction="bottom">
        <div className="text-center mb-14">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: '#FEF3C7', color: '#D97706' }}>
            Pet Parent Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#0D4B4D' }}>Happy Pets, Happy Families</h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {previewReviews.map((r, i) => (
          <Reveal key={r.name} direction="bottom" delay={i * 0.1}>
            <div className="p-6 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="flex gap-1 mb-4">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-gray-600 italic flex-1 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-amber-50">
                <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <div><p className="font-semibold text-sm" style={{ color: '#0D4B4D' }}>{r.name}</p><p className="text-xs text-gray-500">{r.role}</p></div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="text-center">
        <Link to="/reviews" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #0D4B4D, #0F6B6E)' }}>
          See All Reviews
        </Link>
      </div>
    </div>
  </section>
);

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: 'pet-road', pet_species: '', pet_breed: '', origin: '', destination: '', details: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await submitQuote(form); setSent(true); } catch { setSent(true); }
    finally { setLoading(false); }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: '#44403C' }}>{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
        style={{ borderColor: '#FCD34D88', background: '#FFFDF7', color: '#1C1917' }}
      />
    </div>
  );

  return (
    <section id="contact" className="py-20" style={{ background: '#0D4B4D' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Reveal direction="bottom">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
              Get a Quote
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Book Your Pet's Transport</h2>
            <p className="text-gray-300">Fill in the details and our team will get back to you within 2 hours.</p>
          </div>
        </Reveal>
        <Reveal direction="bottom" delay={0.1}>
          {sent ? (
            <div className="text-center py-16 rounded-2xl bg-white/10 border border-amber-400/30">
              <div className="text-5xl mb-4">🐾</div>
              <h3 className="text-xl font-bold text-white mb-2">Quote Request Sent!</h3>
              <p className="text-gray-300">Our team will contact you within 2 hours with a personalized plan.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-8 space-y-4" style={{ background: 'rgba(255,248,237,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('name', 'Your Name', 'text', 'Jane Smith')}
                {field('email', 'Email', 'email', 'jane@email.com')}
                {field('phone', 'Phone', 'tel', '+1 555-000-0000')}
                <div>
                  <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide text-gray-300">Service Type</label>
                  <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                    style={{ borderColor: '#FCD34D88', background: '#0D4B4D', color: '#FFF8ED', borderWidth: 1 }}>
                    <option value="pet-road">Road Transport</option>
                    <option value="pet-air">Air Transport</option>
                    <option value="pet-sea">Sea / International</option>
                    <option value="pet-relocation">Full Relocation</option>
                    <option value="other-cargo">Other Cargo</option>
                  </select>
                </div>
                {field('pet_species', 'Pet Species', 'text', 'e.g. Dog, Cat, Horse')}
                {field('pet_breed', 'Breed / Type', 'text', 'e.g. Golden Retriever')}
                {field('origin', 'Origin City', 'text', 'Houston, TX')}
                {field('destination', 'Destination City', 'text', 'New York, NY')}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide text-gray-300">Additional Details</label>
                <textarea rows={3} value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                  placeholder="Age, weight, special needs, vaccination status..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                  style={{ borderColor: '#FCD34D88', background: '#FFFDF7', color: '#1C1917' }} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Request a Quote'}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
};
