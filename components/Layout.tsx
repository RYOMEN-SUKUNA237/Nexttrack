import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronUp, PawPrint, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps { children: React.ReactNode; }

const navLinks = [
  { label: 'Home',       href: '#home' },
  { label: 'Our Services', href: '#services' },
  { label: 'Track Pet',  href: '#track' },
  { label: 'Pet Types',  href: '#pet-types' },
  { label: 'Why Us',     href: '#why-us' },
  { label: 'Reviews',    href: '/reviews' },
  { label: 'FAQ',        href: '#faq' },
  { label: 'Contact',    href: '#contact' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [showTop, setShowTop]       = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 20); setShowTop(window.scrollY > 600); };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (href: string) => {
    if (href.startsWith('/')) { navigate(href); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const id = href.replace('#', '');
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFF8ED' }}>

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="hidden lg:block text-xs py-2" style={{ background: '#0D4B4D', color: '#FCD34D' }}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <PawPrint className="w-3 h-3" />
            Certified IATA Live Animal Regulation handlers · All species welcome
          </span>
          <span className="opacity-70">24/7 Pet Wellness Monitoring</span>
        </div>
      </div>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-xl' : ''
        }`}
        style={{ background: scrolled ? 'rgba(255,248,237,0.97)' : '#FFF8ED', borderBottom: '1px solid #FCD34D44' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" onClick={() => go('#home')} className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-xl font-bold tracking-tight" style={{ color: '#0D4B4D' }}>Paw</span>
              <span className="text-xl font-bold tracking-tight" style={{ color: '#F59E0B' }}>Track</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center space-x-5 text-sm font-medium" style={{ color: '#44403C' }}>
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                onClick={(e) => { e.preventDefault(); go(link.href); }}
                className="hover:text-amber-600 transition-colors relative group whitespace-nowrap"
                style={{ color: '#44403C' }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a href="#track" onClick={(e) => { e.preventDefault(); go('#track'); }}
              className="hidden lg:flex px-5 py-2.5 text-white text-sm font-semibold rounded-xl items-center gap-2 group transition-all shadow-lg hover:shadow-amber-400/40"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
            >
              Track My Pet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#0D4B4D' }}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden overflow-hidden border-t"
              style={{ background: '#FFF8ED', borderColor: '#FCD34D44' }}
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.button key={link.label} onClick={() => go(link.href)}
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-colors hover:bg-amber-50"
                    style={{ color: '#44403C' }}
                  >
                    {link.label}
                  </motion.button>
                ))}
                <div className="pt-3 border-t" style={{ borderColor: '#FCD34D44' }}>
                  <button onClick={() => go('#track')}
                    className="w-full py-3 text-white text-sm font-semibold rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                  >
                    Track My Pet
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main */}
      <main className="flex-grow">{children}</main>

      {/* Scroll to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-50 w-12 h-12 text-white rounded-full shadow-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: '#0D4B4D', color: '#FFF8ED' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Next Trace</span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#B2D8D8' }}>
                The world's most trusted pet transport & tracking platform. Every paw matters, every journey is monitored.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#FCD34D' }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider" style={{ color: '#FCD34D' }}>Pet Services</h4>
              <ul className="space-y-3 text-sm" style={{ color: '#B2D8D8' }}>
                {['Dog Transport', 'Cat Transport', 'Bird & Exotic Transport', 'Horse & Livestock', 'Reptile Transport', 'Small Mammal Transport'].map(s => (
                  <li key={s}><a href="#services" onClick={e => { e.preventDefault(); go('#services'); }} className="hover:text-amber-400 transition-colors">{s}</a></li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider" style={{ color: '#FCD34D' }}>Quick Links</h4>
              <ul className="space-y-3 text-sm" style={{ color: '#B2D8D8' }}>
                {navLinks.slice(0, 5).map(link => (
                  <li key={link.label}>
                    <a href={link.href} onClick={e => { e.preventDefault(); go(link.href); }} className="hover:text-amber-400 transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider" style={{ color: '#FCD34D' }}>Certifications</h4>
              <ul className="space-y-3 text-sm" style={{ color: '#B2D8D8' }}>
                <li>✓ IATA Live Animal Regulations</li>
                <li>✓ USDA Certified Handlers</li>
                <li>✓ CITES Compliant</li>
                <li>✓ 24/7 Vet On-Call</li>
                <li>✓ GPS Wellness Monitoring</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs" style={{ color: '#6B9999' }}>
            <p>© {new Date().getFullYear()} Next Trace Global Pet Transport. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Animal Welfare Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;