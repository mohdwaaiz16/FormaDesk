import React from 'react';
import type { Company } from '../types/invoice';
import { INDIAN_STATES } from '../utils/indianStates';

interface Props {
  data: Company;
  onChange: (field: keyof Company, value: string) => void;
  errors: Record<string, string>;
}

export const CompanyDetails: React.FC<Props> = ({ data, onChange, errors }) => {
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    onChange('state', selectedStateName);
    
    const selectedState = INDIAN_STATES.find(s => s.name === selectedStateName);
    if (selectedState) {
      onChange('stateCode', selectedState.code);
    }
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Company / Supplier Details</h2>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Company Name <span className="required">*</span></label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter company name"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          {errors['company.name'] && <span className="error-text">{errors['company.name']}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">GST Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter GST number"
            value={data.gstNumber}
            onChange={(e) => onChange('gstNumber', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter company email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            className="form-input"
            placeholder="Enter phone number"
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
            placeholder="Enter complete company address"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
          {errors['company.address'] && <span className="error-text">{errors['company.address']}</span>}
        </div>
      </div>
    </div>
  );
};
