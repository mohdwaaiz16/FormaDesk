import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { InvoiceStepper } from '../components/InvoiceStepper';
import { initialInvoice } from '../types/invoice';
import type { Invoice, InvoiceItem } from '../types/invoice';
import { 
  calculateItemAmount, 
  calculateItemSgst, 
  calculateItemCgst, 
  calculateItemTotal, 
  formatCurrency 
} from '../utils/calculations';

export const Part2Items: React.FC = () => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('formadesk_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as Invoice;
        // If there are no items, initialize with one empty row
        if (!parsed.items || parsed.items.length === 0) {
          parsed.items = [{
            id: crypto.randomUUID(),
            description: '',
            quantity: 0,
            rate: 0,
            amount: 0
          }];
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

  const handleAddItem = () => {
    setInvoice(prev => {
      const newItem: InvoiceItem = {
        id: crypto.randomUUID(),
        description: '',
        quantity: 0,
        rate: 0,
        amount: 0
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const handleDeleteItem = (id: string) => {
    setInvoice(prev => {
      const filtered = prev.items.filter(item => item.id !== id);
      // Ensure at least one empty row remains if all are deleted
      if (filtered.length === 0) {
        return {
          ...prev,
          items: [{
            id: crypto.randomUUID(),
            description: '',
            quantity: 0,
            rate: 0,
            amount: 0
          }]
        };
      }
      return { ...prev, items: filtered };
    });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Only automatically calculate amount if quantity or rate changed
          // We don't store amount persistently as it's derived, but it's in the interface
          if (field === 'quantity' || field === 'rate') {
             updatedItem.amount = calculateItemAmount(Number(updatedItem.quantity), Number(updatedItem.rate));
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];
    
    // Check if there's at least one valid item, or if the single item is just empty
    const activeItems = invoice.items.filter(i => i.description.trim() !== '' || Number(i.quantity) > 0 || Number(i.rate) > 0);
    
    if (activeItems.length === 0) {
      newErrors.push("Please add at least one item.");
    } else {
      activeItems.forEach((item, index) => {
        if (!item.description.trim()) {
          newErrors.push(`Row ${index + 1}: Particulars are required.`);
        }
        if (Number(item.quantity) <= 0) {
          newErrors.push(`Row ${index + 1}: Quantity must be greater than 0.`);
        }
        if (Number(item.rate) < 0) {
          newErrors.push(`Row ${index + 1}: Unit price cannot be negative.`);
        }
      });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      // Clean up empty rows before proceeding
      const cleanedItems = invoice.items.filter(i => i.description.trim() !== '' || Number(i.quantity) > 0 || Number(i.rate) > 0);
      const invoiceToSave = { ...invoice, items: cleanedItems };
      saveDraft(invoiceToSave);
      navigate('/summary');
    }
  };

  const handleBack = () => {
    saveDraft(invoice);
    navigate('/');
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Invoice Items</h1>
        <div className="header-status">
          {saveStatus === 'saved' && <span className="save-status saved"><Check size={14} /> Saved</span>}
          {saveStatus === 'saving' && <span className="save-status">Saving...</span>}
        </div>
      </div>
      
      <InvoiceStepper currentStep={2} />
      
      <div className="form-section" style={{ padding: 0, border: 'none', backgroundColor: 'transparent' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ borderBottom: 'none', margin: 0 }}>Items</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Add the products or services included in this proforma invoice.
          </p>
        </div>

        {errors.length > 0 && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#b91c1c', fontSize: '0.875rem' }}>
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Particulars</th>
                <th>Quantity/sq ft</th>
                <th>Unit Price in INR</th>
                <th>TOTAL AMOUNT</th>
                <th>SGST RATE @ {invoice.gst.sgstRate}%</th>
                <th>CGST RATE @ {invoice.gst.cgstRate}%</th>
                <th>Total amount in INR</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>No items added yet</div>
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, index) => {
                  const amount = calculateItemAmount(Number(item.quantity) || 0, Number(item.rate) || 0);
                  const sgst = calculateItemSgst(amount, invoice.gst.sgstRate);
                  const cgst = calculateItemCgst(amount, invoice.gst.cgstRate);
                  const total = calculateItemTotal(amount, sgst, cgst);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="calculated-value" style={{ textAlign: 'center' }}>
                          {index + 1}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input particulars"
                          placeholder="Enter item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input number"
                          placeholder="0"
                          min="0"
                          step="any"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input number"
                          placeholder="0.00"
                          min="0"
                          step="any"
                          value={item.rate === 0 ? '' : item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="calculated-value">
                          {formatCurrency(amount)}
                        </div>
                      </td>
                      <td>
                        <div className="calculated-value">
                          {formatCurrency(sgst)}
                        </div>
                      </td>
                      <td>
                        <div className="calculated-value">
                          {formatCurrency(cgst)}
                        </div>
                      </td>
                      <td>
                        <div className="calculated-value" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatCurrency(total)}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <button className="add-item-btn" onClick={handleAddItem}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <button className="btn btn-primary" onClick={handleContinue}>
          Continue <ArrowRight size={16} />
        </button>
      </div>

      <div className="footer-note">
        GST is calculated automatically at SGST {invoice.gst.sgstRate}% + CGST {invoice.gst.cgstRate}%.
      </div>
    </div>
  );
};
