import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { InvoiceStepper } from '../components/InvoiceStepper';
import { CompanyDetails } from '../components/CompanyDetails';
import { BuyerDetails } from '../components/BuyerDetails';
import { InvoiceInformation } from '../components/InvoiceInformation';
import { initialInvoice } from '../types/invoice';
import type { Invoice, Company, Buyer, InvoiceInfo } from '../types/invoice';
import { useCompany } from '../context/CompanyContext';

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { company } = useCompany();

  useEffect(() => {
    const savedData = localStorage.getItem('formadesk_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Force inject logged-in company details so they are always present
        if (company) {
          parsed.company = {
            ...parsed.company,
            name: company.name || parsed.company.name || '',
            address: company.address || parsed.company.address || '',
            gstNumber: company.gst_number || parsed.company.gstNumber || '',
            email: company.email || parsed.company.email || '',
            phone: company.phone || parsed.company.phone || '',
            state: company.state || parsed.company.state || '',
            stateCode: company.state_code || parsed.company.stateCode || '',
          };
        }
        setInvoice(parsed);
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    } else if (company) {
      // Auto-populate company details for new invoice
      setInvoice(prev => ({
        ...prev,
        company: {
          name: company.name || '',
          address: company.address || '',
          gstNumber: company.gst_number || '',
          email: company.email || '',
          phone: company.phone || '',
          state: company.state || '',
          stateCode: company.state_code || '',
        }
      }));
    }
    setIsInitialLoad(false);
  }, [company]);

  // Auto-save logic
  useEffect(() => {
    if (isInitialLoad) return;
    
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveDraft();
    }, 1000);
    return () => clearTimeout(timer);
  }, [invoice, isInitialLoad]);

  const saveDraft = () => {
    localStorage.setItem('formadesk_draft', JSON.stringify(invoice));
    setSaveStatus('saved');
  };

  const handleCompanyChange = (field: keyof Company, value: string) => {
    setInvoice(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }));
    if (errors[`company.${field}`]) {
      setErrors(prev => ({ ...prev, [`company.${field}`]: '' }));
    }
  };

  const handleBuyerChange = (field: keyof Buyer, value: string) => {
    setInvoice(prev => ({
      ...prev,
      buyer: { ...prev.buyer, [field]: value }
    }));
    if (errors[`buyer.${field}`]) {
      setErrors(prev => ({ ...prev, [`buyer.${field}`]: '' }));
    }
  };

  const handleInvoiceChange = (field: keyof InvoiceInfo, value: string) => {
    setInvoice(prev => ({
      ...prev,
      invoice: { ...prev.invoice, [field]: value }
    }));
    if (errors[`invoice.${field}`]) {
      setErrors(prev => ({ ...prev, [`invoice.${field}`]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!invoice.company.name.trim()) newErrors['company.name'] = 'Company name is required';
    if (!invoice.company.address.trim()) newErrors['company.address'] = 'Company address is required';
    
    if (!invoice.buyer.name.trim()) newErrors['buyer.name'] = 'Buyer name is required';
    if (!invoice.buyer.address.trim()) newErrors['buyer.address'] = 'Buyer address is required';
    
    if (!invoice.invoice.piNumber.trim()) newErrors['invoice.piNumber'] = 'PI Number is required';
    if (!invoice.invoice.piDate.trim()) newErrors['invoice.piDate'] = 'PI Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      saveDraft();
      navigate('/items');
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Create Proforma Invoice</h1>
        <div className="header-status">
          {saveStatus === 'saved' && <span className="save-status saved"><Check size={14} /> Saved</span>}
          {saveStatus === 'saving' && <span className="save-status">Saving...</span>}
        </div>
      </div>
      
      <InvoiceStepper currentStep={1} />
      
      <div className="form-container">
        <CompanyDetails 
          data={invoice.company} 
          onChange={handleCompanyChange} 
          errors={errors} 
        />
        
        <BuyerDetails 
          data={invoice.buyer} 
          onChange={handleBuyerChange} 
          errors={errors} 
        />
        
        <InvoiceInformation 
          data={invoice.invoice} 
          onChange={handleInvoiceChange} 
          errors={errors} 
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={() => {
          saveDraft();
          setSaveStatus('saved');
        }}>
          Save Draft
        </button>
        
        <button className="btn btn-primary" onClick={handleContinue}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
