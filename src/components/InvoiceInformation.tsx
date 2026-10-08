import React from 'react';
import type { InvoiceInfo } from '../types/invoice';

interface Props {
  data: InvoiceInfo;
  onChange: (field: keyof InvoiceInfo, value: string) => void;
  errors: Record<string, string>;
}

export const InvoiceInformation: React.FC<Props> = ({ data, onChange, errors }) => {
  return (
    <div className="form-section">
      <h2 className="section-title">Proforma Invoice Information</h2>
      <div className="form-grid thirds">
        <div className="form-group">
          <label className="form-label">PI No. <span className="required">*</span></label>
          <input
            type="text"
            className="form-input"
            placeholder="PI-0001"
            value={data.piNumber}
            onChange={(e) => onChange('piNumber', e.target.value)}
          />
          {errors['invoice.piNumber'] && <span className="error-text">{errors['invoice.piNumber']}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">PI Date <span className="required">*</span></label>
          <input
            type="date"
            className="form-input"
            value={data.piDate}
            onChange={(e) => onChange('piDate', e.target.value)}
          />
          {errors['invoice.piDate'] && <span className="error-text">{errors['invoice.piDate']}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Valid Until</label>
          <input
            type="date"
            className="form-input"
            value={data.validUntil}
            onChange={(e) => onChange('validUntil', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Place of Supply</label>
          <select 
            className="form-select"
            value={data.placeOfSupply}
            onChange={(e) => onChange('placeOfSupply', e.target.value)}
          >
            <option value="">Select State</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Delhi">Delhi</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
          </select>
        </div>
      </div>
    </div>
  );
};
