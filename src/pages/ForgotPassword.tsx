import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await authService.resetPassword(email);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.75rem' }}>FormaDesk</h1>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Reset Password</h2>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        {message && <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>{message}</div>}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--btn-primary)', color: 'var(--btn-primary-text)', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};
