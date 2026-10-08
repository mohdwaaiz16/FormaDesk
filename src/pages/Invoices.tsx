import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Invoices = () => {
  const { company } = useCompany();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    if (!company) return;
    setLoading(true);
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
      
    if (data) setInvoices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [company]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this invoice? This action cannot be undone.')) {
      await supabase.from('invoices').delete().eq('id', id);
      fetchInvoices();
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.pi_number.toLowerCase().includes(search.toLowerCase()) || 
    inv.buyer_details?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Invoice History</h1>
        <button 
          onClick={() => navigate('/invoices/new')}
          style={{ backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Create Invoice
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by PI Number or Customer..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.75rem', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        />
      </div>

      <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: '500' }}>PI Number</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Customer</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Amount</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '500', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading invoices...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No invoices found.</td></tr>
            ) : (
              filteredInvoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{inv.pi_number}</td>
                  <td style={{ padding: '1rem' }}>{inv.buyer_details?.name}</td>
                  <td style={{ padding: '1rem' }}>{new Date(inv.pi_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>₹{inv.totals?.grandTotal || 0}</td>
                  <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'var(--beige)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{inv.status}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => navigate(`/preview`)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--primary-color)', marginRight: '10px' }}>View</button>
                    <button onClick={() => handleDelete(inv.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#b91c1c' }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
