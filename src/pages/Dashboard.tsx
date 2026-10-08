import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const { company } = useCompany();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, recent: [] as any[] });

  useEffect(() => {
    if (company) {
      const fetchStats = async () => {
        const { data, count } = await supabase
          .from('invoices')
          .select('id, pi_number, pi_date, totals, status', { count: 'exact' })
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (data) {
          setStats({ total: count || 0, recent: data });
        }
      };
      fetchStats();
    }
  }, [company]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Welcome, {company?.name || 'Company Name'}</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Invoices</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.total}</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            onClick={() => {
              localStorage.removeItem('formadesk_draft');
              navigate('/invoices/new');
            }}
            style={{ backgroundColor: 'var(--btn-primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '4px', cursor: 'pointer', width: '100%', fontSize: '1.1rem', fontWeight: '500' }}
          >
            + Create Proforma Invoice
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Invoices</h2>
      <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: '500' }}>PI Number</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Amount</th>
              <th style={{ padding: '1rem', fontWeight: '500' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No invoices yet.</td>
              </tr>
            ) : (
              stats.recent.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{inv.pi_number}</td>
                  <td style={{ padding: '1rem' }}>{new Date(inv.pi_date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>₹{inv.totals?.grandTotal || 0}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ backgroundColor: 'var(--beige)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{inv.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
          <Link to="/invoices" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>View All Invoices</Link>
        </div>
      </div>
    </div>
  );
};
