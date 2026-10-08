import React, { useState, useEffect } from 'react';
import type { Buyer } from '../types/invoice';
import { INDIAN_STATES } from '../utils/indianStates';
import { supabase } from '../lib/supabase';
import { useCompany } from '../context/CompanyContext';

interface Props {
  data: Buyer;
  onChange: (field: keyof Buyer, value: string) => void;
  errors: Record<string, string>;
}

export const BuyerDetails: React.FC<Props> = ({ data, onChange, errors }) => {
  const { company } = useCompany();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!company) return;
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', company.id)
        .order('name');
      if (customerData) {
        setCustomers(customerData);
      }
    };
    fetchCustomers();
  }, [company]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    onChange('state', selectedStateName);
    
    const selectedState = INDIAN_STATES.find(s => s.name === selectedStateName);
    if (selectedState) {
      onChange('stateCode', selectedState.code);
    }
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    if (!custId) return;
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      onChange('name', cust.name || '');
      onChange('email', cust.email || '');
      onChange('phone', cust.phone || '');
      onChange('address', cust.address || '');
      onChange('gstNumber', cust.gst_number || '');
      onChange('state', cust.state || '');
      onChange('stateCode', cust.state_code || '');
    }
  };

  return (
    <div className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Buyer / Customer Details</h2>
        
        <select 
          className="form-select" 
          onChange={handleCustomerSelect}
          style={{ width: 'auto', minWidth: '200px' }}
        >
          <option value="">-- Select Existing Customer --</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Buyer Name <span className="required">*</span></label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter buyer name"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          {errors['buyer.name'] && <span className="error-text">{errors['buyer.name']}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">GST Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter buyer GST number"
            value={data.gstNumber}
            onChange={(e) => onChange('gstNumber', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter buyer email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            className="form-input"
            placeholder="Enter buyer phone"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">State</label>
          <select 
            className="form-select"
            value={data.state}
            onChange={handleStateChange}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state.code} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">State Code</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter state code"
            value={data.stateCode}
            onChange={(e) => onChange('stateCode', e.target.value)}
          />
        </div>
        
        <div className="form-group full-width">
          <label className="form-label">Address <span className="required">*</span></label>
          <textarea
            className="form-textarea"
            placeholder="Enter complete buyer address"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
          {errors['buyer.address'] && <span className="error-text">{errors['buyer.address']}</span>}
        </div>
      </div>
    </div>
  );
};
