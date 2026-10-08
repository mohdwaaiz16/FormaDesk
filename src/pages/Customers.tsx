import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { supabase } from '../lib/supabase';

export const Customers = () => {
  const { company } = useCompany();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', state: '', state_code: '', gst_number: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    if (!company) return;
    setLoading(true);
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', company.id)
      .order('name', { ascending: true });
      
    if (data) setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [company]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this customer? This action cannot be undone.')) {
      await supabase.from('customers').delete().eq('id', id);
      fetchCustomers();
    }
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      state: customer.state || '',
      state_code: customer.state_code || '',
      gst_number: customer.gst_number || ''
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '', email: '', phone: '', address: '', state: '', state_code: '', gst_number: ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    
    try {
      if (editingId) {
        await supabase.from('customers').update(formData).eq('id', editingId);
      } else {
        await supabase.from('customers').insert([{ ...formData, company_id: company.id }]);
      }
      await fetchCustomers();
      setIsEditing(false);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.gst_number && c.gst_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Customers</h1>
        <button 
          onClick={handleAddNew}
          style={{ backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Add Customer
        </button>
      </div>

      {isEditing ? (
        <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Customer Name <span className="required">*</span></label>
              <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
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
              <button type="submit" disabled={saving} style={{ backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Customer'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Search by Customer Name or GST..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.75rem', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
          </div>

          <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '1rem', fontWeight: '500' }}>Contact</th>
                  <th style={{ padding: '1rem', fontWeight: '500' }}>Location</th>
                  <th style={{ padding: '1rem', fontWeight: '500' }}>GST</th>
                  <th style={{ padding: '1rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading customers...</td></tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No customers found.</td></tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{c.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <div>{c.email || '-'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.phone || '-'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{c.state || '-'} {c.state_code ? `(${c.state_code})` : ''}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.address || '-'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{c.gst_number || '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => handleEdit(c)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--primary-color)', marginRight: '10px' }}>Edit</button>
                        <button onClick={() => handleDelete(c.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#b91c1c' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
