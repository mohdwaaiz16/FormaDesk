import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { APP_VERSION } from '../config/version';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Settings = () => {
  const { user, signOut } = useAuth();
  const { profile, company, refreshCompany } = useCompany();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    address: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    state_code: ''
  });

  const handleEditClick = () => {
    if (company) {
      setFormData({
        name: company.name || '',
        gst_number: company.gst_number || '',
        address: company.address || '',
        email: company.email || '',
        phone: company.phone || '',
        city: company.city || '',
        state: company.state || '',
        state_code: company.state_code || ''
      });
    }
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('companies').update(formData).eq('id', company.id);
      if (error) throw error;
      await refreshCompany();
      setIsEditing(false);
    } catch (err: any) {
      alert("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Settings</h1>

      <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Account</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div><strong>Name:</strong> {profile?.full_name}</div>
          <div><strong>Email:</strong> {user?.email}</div>
        </div>
        <button 
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ marginTop: '1.5rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Company Profile</h2>
        
        {isEditing ? (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Company Name</label>
              <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone</label>
              <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Address</label>
              <input className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">City</label>
              <input className="form-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">State</label>
              <input className="form-input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">State Code</label>
              <input className="form-input" value={formData.state_code} onChange={e => setFormData({...formData, state_code: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">GST Number</label>
              <input className="form-input" value={formData.gst_number} onChange={e => setFormData({...formData, gst_number: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={(e) => handleSave(e as any)} disabled={saving} style={{ backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><strong>Company Name:</strong> {company?.name}</div>
            <div><strong>Email:</strong> {company?.email || 'N/A'}</div>
            <div><strong>Phone:</strong> {company?.phone || 'N/A'}</div>
            <div><strong>GST Number:</strong> {company?.gst_number || 'N/A'}</div>
            <div><strong>Address:</strong> {company?.address || 'N/A'}, {company?.city}, {company?.state} {company?.state_code ? `(${company.state_code})` : ''}</div>
            <button onClick={handleEditClick} style={{ marginTop: '1rem', backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', width: 'fit-content', cursor: 'pointer' }}>
              Edit Company Details
            </button>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Application</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div><strong>Version:</strong> {APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
};
