import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem' }}>FormaDesk</h1>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Sign In</h2>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              backgroundColor: 'var(--btn-primary)', 
              color: 'var(--btn-primary-text)', 
              padding: '0.75rem', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '1rem', 
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot Password?</Link>
          <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Create Company Account</Link>
        </div>
      </div>
    </div>
  );
};
