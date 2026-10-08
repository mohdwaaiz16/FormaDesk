import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { InvoiceStepper } from '../components/InvoiceStepper';
import type { Invoice } from '../types/invoice';
import { initialInvoice } from '../types/invoice';
import { 
  calculateTaxableTotal,
  calculateTotalSgst,
  calculateTotalCgst,
  calculateGrandTotal,
  calculateRoundOff,
  formatCurrency 
} from '../utils/calculations';
import { convertNumberToWords } from '../utils/numberToWords';

export const Part3Summary: React.FC = () => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('formadesk_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as Invoice;
        
        // Ensure additionalDetails exists for older drafts
        if (!parsed.additionalDetails) {
          parsed.additionalDetails = initialInvoice.additionalDetails;
        }

        setInvoice(parsed);
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
    setIsInitialLoad(false);
  }, []);

  const saveDraft = useCallback((currentInvoice: Invoice) => {
    localStorage.setItem('formadesk_draft', JSON.stringify(currentInvoice));
    setSaveStatus('saved');
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (isInitialLoad) return;
    
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveDraft(invoice);
    }, 1000);
    return () => clearTimeout(timer);
  }, [invoice, isInitialLoad, saveDraft]);

  const handleBankChange = (field: keyof Invoice['additionalDetails']['bank'], value: string) => {
    setInvoice(prev => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        bank: {
          ...prev.additionalDetails.bank,
          [field]: value
        }
      }
    }));
  };

  const handleDetailsChange = (field: 'paymentTerms' | 'deliveryDates' | 'termsAndConditions' | 'notes', value: string) => {
    setInvoice(prev => ({
      ...prev,
      additionalDetails: {
        ...prev.additionalDetails,
        [field]: value
      }
    }));
  };

  const handleBack = () => {
    saveDraft(invoice);
    navigate('/items');
  };

  const taxableTotal = calculateTaxableTotal(invoice.items);
  const totalSgst = calculateTotalSgst(invoice.items, invoice.gst.sgstRate);
  const totalCgst = calculateTotalCgst(invoice.items, invoice.gst.cgstRate);
  const totalBeforeRoundOff = taxableTotal + totalSgst + totalCgst;
  const roundOff = calculateRoundOff(totalBeforeRoundOff);
  const grandTotal = calculateGrandTotal(taxableTotal, totalSgst, totalCgst) + roundOff;
  
  const saveTotalsBeforeContinuing = () => {
    const invoiceWithTotals = {
      ...invoice,
      totals: {
        subtotal: taxableTotal,
        sgst: totalSgst,
        cgst: totalCgst,
        roundOff: roundOff,
        grandTotal: grandTotal
      }
    };
    saveDraft(invoiceWithTotals);
    navigate('/preview');
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Invoice Summary</h1>
        <div className="header-status">
          {saveStatus === 'saved' && <span className="save-status saved"><Check size={14} /> Saved</span>}
          {saveStatus === 'saving' && <span className="save-status">Saving...</span>}
        </div>
      </div>
      
      <InvoiceStepper currentStep={3} />
      
      <div className="summary-container">
        
        {/* Right side panel */}
        <div className="summary-panel">
          <h2 className="section-title">Invoice Summary</h2>
          
          <div className="summary-row">
            <span>Total Amount</span>
            <span>{formatCurrency(taxableTotal)}</span>
          </div>
          
          <div className="summary-row">
            <span>SGST @ {invoice.gst.sgstRate}%</span>
            <span>{formatCurrency(totalSgst)}</span>
          </div>
          
          <div className="summary-row">
            <span>CGST @ {invoice.gst.cgstRate}%</span>
            <span>{formatCurrency(totalCgst)}</span>
          </div>
          
          <div className="summary-row total-row">
            <span>Total Before Round Off</span>
            <span>{formatCurrency(totalBeforeRoundOff)}</span>
          </div>
          
          <div className="summary-row">
            <span>Round Off</span>
            <span>{roundOff < 0 ? '-' : '+'}{formatCurrency(Math.abs(roundOff))}</span>
          </div>
          
          <div className="summary-row grand-total" style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '1rem' }}>
            <span>GRAND TOTAL</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>

          <div className="words-panel">
            <div className="words-title">Amount in Words</div>
            <div className="words-content">{convertNumberToWords(grandTotal)}</div>
          </div>
        </div>

        {/* Left side details */}
        <div className="summary-details">
          
          <div className="form-section" style={{ margin: 0 }}>
            <h2 className="section-title">Bank Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter bank name"
                  value={invoice.additionalDetails.bank.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter account holder name"
                  value={invoice.additionalDetails.bank.accountName}
                  onChange={(e) => handleBankChange('accountName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter account number"
                  value={invoice.additionalDetails.bank.accountNumber}
                  onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">IFSC Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter IFSC code"
                  value={invoice.additionalDetails.bank.ifsc}
                  onChange={(e) => handleBankChange('ifsc', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter branch"
                  value={invoice.additionalDetails.bank.branch}
                  onChange={(e) => handleBankChange('branch', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Current, Savings"
                  value={invoice.additionalDetails.bank.accountType}
                  onChange={(e) => handleBankChange('accountType', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section" style={{ margin: 0 }}>
            <h2 className="section-title">Payment Details</h2>
            <div className="form-group full-width">
              <label className="form-label">Payment Terms</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. 100% payment against proforma invoice."
                value={invoice.additionalDetails.paymentTerms}
                onChange={(e) => handleDetailsChange('paymentTerms', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section" style={{ margin: 0 }}>
            <h2 className="section-title">Delivery Dates</h2>
            <div className="form-group full-width">
              <textarea
                className="form-textarea"
                placeholder="e.g. 4-6 weeks from date of advance payment."
                value={invoice.additionalDetails.deliveryDates}
                onChange={(e) => handleDetailsChange('deliveryDates', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section" style={{ margin: 0 }}>
            <h2 className="section-title">Terms & Conditions</h2>
            <div className="form-group full-width">
              <textarea
                className="form-textarea"
                placeholder="Enter terms and conditions..."
                style={{ minHeight: '120px' }}
                value={invoice.additionalDetails.termsAndConditions}
                onChange={(e) => handleDetailsChange('termsAndConditions', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section" style={{ margin: 0 }}>
            <h2 className="section-title">Notes / Remarks</h2>
            <div className="form-group full-width">
              <textarea
                className="form-textarea"
                placeholder="Add any additional notes..."
                value={invoice.additionalDetails.notes}
                onChange={(e) => handleDetailsChange('notes', e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <button className="btn btn-primary" onClick={saveTotalsBeforeContinuing}>
          Continue <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};
