import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Users, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/invoices/new', label: 'New', icon: <PlusCircle size={20} /> },
    { path: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="mobile-bottom-nav hide-on-desktop">
      {navItems.map(item => {
        const isActive = location.pathname.includes(item.path) || (item.path === '/invoices/new' && location.pathname.includes('/items'));
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
