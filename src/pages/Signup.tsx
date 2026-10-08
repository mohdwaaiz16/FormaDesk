import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export const Signup = () => {
  const [formData, setFormData] = useState({
    companyName: '', email: '', phone: '', address: '', city: '', state: '', stateCode: '', gstNumber: '',
    ownerName: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.signUp(
        formData.email,
        formData.password,
        formData.ownerName,
        {
          name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          state_code: formData.stateCode,
          gst_number: formData.gstNumber
        }
      );
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-light)', padding: '2rem 1rem' }}>
      <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px' }}>
        <h1 style={{ color: 'var(--primary-color)', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>FormaDesk</h1>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-color)' }}>Create Company Account</h2>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Company Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Company Name <span style={{color: '#ef4444'}}>*</span></label>
                <input required className="form-input" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email <span style={{color: '#ef4444'}}>*</span></label>
                <input type="email" required className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone</label>
                <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                <label className="form-label">Address <span style={{color: '#ef4444'}}>*</span></label>
                <input required className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">State <span style={{color: '#ef4444'}}>*</span></label>
                <input required className="form-input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">State Code</label>
                <input className="form-input" value={formData.stateCode} onChange={e => setFormData({...formData, stateCode: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">GST Number</label>
                <input className="form-input" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Account Owner</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Owner Name <span style={{color: '#ef4444'}}>*</span></label>
                <input required className="form-input" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password <span style={{color: '#ef4444'}}>*</span></label>
                <input type="password" required className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm Password <span style={{color: '#ef4444'}}>*</span></label>
                <input type="password" required className="form-input" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            style={{ 
              backgroundColor: 'var(--btn-primary)', color: 'var(--btn-primary-text)', padding: '1rem', 
              border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
