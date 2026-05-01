import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TrackingDashboard from './pages/TrackingDashboard';
import ServiceDetailPage from './pages/ServiceDetail';
import ReviewsPage from './pages/Reviews';
import ChatWidget from './components/ChatWidget';
import { AnimatePresence } from 'framer-motion';

/* Simple error boundary to surface crashes */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a1628', minHeight: '100vh', color: '#f8fafc' }}>
          <h2 style={{ color: '#f43f5e', marginBottom: 16, fontSize: 20 }}>⚠ Runtime Error</h2>
          <pre style={{ background: '#0f2040', padding: 20, borderRadius: 8, color: '#fca5a5', whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {err.message}{'\n\n'}{err.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/dashboard');

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
          <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/track/:trackingId" element={<ErrorBoundary><TrackingDashboard /></ErrorBoundary>} />
          <Route path="/services/:slug" element={<ErrorBoundary><ServiceDetailPage /></ErrorBoundary>} />
          <Route path="/reviews" element={<ErrorBoundary><ReviewsPage /></ErrorBoundary>} />
        </Routes>
      </AnimatePresence>
      {!isAdmin && <ChatWidget />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;