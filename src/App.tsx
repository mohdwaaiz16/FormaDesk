import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { CreateInvoice } from './pages/CreateInvoice';
import { Part2Items } from './pages/Part2Items';
import { Part3Summary } from './pages/Part3Summary';
import { Part4Preview } from './pages/Part4Preview';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Invoices } from './pages/Invoices';
import { Customers } from './pages/Customers';
import { Settings } from './pages/Settings';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { IosInstallGuide } from './components/pwa/IosInstallGuide';
import { UpdatePrompt } from './components/pwa/UpdatePrompt';
import { BottomNav } from './components/BottomNav';

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="app-brand" style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>FormaDesk</div>
      <nav className="app-nav" style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: location.pathname === '/dashboard' ? 'var(--primary-color)' : 'var(--text-color)' }}>Dashboard</Link>
        <Link to="/invoices/new" style={{ textDecoration: 'none', color: location.pathname.includes('/invoices/new') ? 'var(--primary-color)' : 'var(--text-color)' }}>Create Invoice</Link>
        <Link to="/invoices" style={{ textDecoration: 'none', color: location.pathname === '/invoices' ? 'var(--primary-color)' : 'var(--text-color)' }}>Invoices</Link>
        <Link to="/customers" style={{ textDecoration: 'none', color: location.pathname === '/customers' ? 'var(--primary-color)' : 'var(--text-color)' }}>Customers</Link>
        <Link to="/settings" style={{ textDecoration: 'none', color: location.pathname === '/settings' ? 'var(--primary-color)' : 'var(--text-color)' }}>Settings</Link>
      </nav>
    </header>
  );
};

function AppContent() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UpdatePrompt />
      <InstallPrompt />
      <IosInstallGuide />
      
      <Navigation />
      <BottomNav />
      
      <main style={{ flex: 1, backgroundColor: 'var(--bg-light)' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Invoice Creation Flow */}
            <Route path="/invoices/new" element={<CreateInvoice />} />
            <Route path="/items" element={<Part2Items />} />
            <Route path="/summary" element={<Part3Summary />} />
            <Route path="/preview" element={<Part4Preview />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <AppContent />
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
