import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Cloud } from 'lucide-react';
import { InvoiceStepper } from '../components/InvoiceStepper';
import type { Invoice } from '../types/invoice';
import { initialInvoice } from '../types/invoice';
import { supabase } from '../lib/supabase';
import { useCompany } from '../context/CompanyContext';
import { 
  calculateTaxableTotal,
  calculateTotalSgst,
  calculateTotalCgst,
  calculateGrandTotal,
  calculateRoundOff,
  formatCurrency,
  calculateItemAmount,
  calculateItemSgst,
  calculateItemCgst,
  calculateItemTotal
} from '../utils/calculations';
import { convertNumberToWords } from '../utils/numberToWords';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const Part4Preview: React.FC = () => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { company } = useCompany();

  useEffect(() => {
    const savedData = localStorage.getItem('formadesk_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as Invoice;
        if (!parsed.additionalDetails) {
          parsed.additionalDetails = initialInvoice.additionalDetails;
        }
        setInvoice(parsed);
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  }, []);

  const handleSaveToCloud = async () => {
    if (!company) {
      alert("You must be logged into a company account to save to the cloud.");
      return;
    }
    
    setSavingStatus('saving');
    try {
      const taxableTotal = calculateTaxableTotal(invoice.items);
      const totalSgst = calculateTotalSgst(invoice.items, invoice.gst.sgstRate);
      const totalCgst = calculateTotalCgst(invoice.items, invoice.gst.cgstRate);
      const totalBeforeRoundOff = taxableTotal + totalSgst + totalCgst;
      const roundOff = calculateRoundOff(totalBeforeRoundOff);
      const grandTotal = calculateGrandTotal(taxableTotal, totalSgst, totalCgst) + roundOff;
      
      const totalsObj = {
        taxableTotal,
        totalSgst,
        totalCgst,
        roundOff,
        grandTotal
      };
      
      // Upsert by pi_number or generate new if we wanted to support editing,
      // but the simplest safe way is insert for now (or assume if we had an invoice ID in state, we'd update).
      // Assuming new invoice for now, or match on pi_number
      
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('company_id', company.id)
        .eq('pi_number', invoice.invoice.piNumber)
        .single();
        
      if (existing) {
        // Update
        const { error } = await supabase.from('invoices').update({
          pi_date: invoice.invoice.piDate,
          company_snapshot: invoice.company,
          buyer_details: invoice.buyer,
          items: invoice.items,
          gst_details: invoice.gst,
          totals: totalsObj,
          additional_details: invoice.additionalDetails,
          status: 'draft'
        }).eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('invoices').insert([{
          company_id: company.id,
          pi_number: invoice.invoice.piNumber,
          pi_date: invoice.invoice.piDate,
          company_snapshot: invoice.company,
          buyer_details: invoice.buyer,
          items: invoice.items,
          gst_details: invoice.gst,
          totals: totalsObj,
          additional_details: invoice.additionalDetails,
          status: 'draft'
        }]);
        if (error) throw error;
      }
      
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 3000);
    } catch (err: any) {
      console.error(err);
      setSavingStatus('error');
      alert("Unable to save this invoice. Please check your internet connection and try again.");
    }
  };

  // Calculate scaling to ensure invoice fits on 1 A4 page
  useEffect(() => {
    if (invoiceRef.current && contentWrapperRef.current) {
      // Small timeout to allow DOM to render fully
      setTimeout(() => {
        if (!invoiceRef.current || !contentWrapperRef.current) return;
        
        const availableHeight = invoiceRef.current.clientHeight;
        const actualHeight = contentWrapperRef.current.scrollHeight;
        
        if (actualHeight > availableHeight) {
          const requiredScale = availableHeight / actualHeight;
          // Apply minimum scale of 0.70 to prevent it becoming unreadable
          setScale(Math.max(0.70, requiredScale));
        } else {
          setScale(1);
        }
      }, 100);
    }
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // higher resolution
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // We explicitly render EXACTLY 1 page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const piNumber = invoice.invoice.piNumber ? invoice.invoice.piNumber.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Draft';
      pdf.save(`PI-${piNumber}.pdf`);
      
      console.log('PDF generated successfully — 1 A4 page');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try printing instead.');
    }
  };

  const taxableTotal = calculateTaxableTotal(invoice.items);
  const totalSgst = calculateTotalSgst(invoice.items, invoice.gst.sgstRate);
  const totalCgst = calculateTotalCgst(invoice.items, invoice.gst.cgstRate);
  const totalBeforeRoundOff = taxableTotal + totalSgst + totalCgst;
  const roundOff = calculateRoundOff(totalBeforeRoundOff);
  const grandTotal = calculateGrandTotal(taxableTotal, totalSgst, totalCgst) + roundOff;
  
  // Clean empty items for display
  const activeItems = invoice.items.filter(i => i.description.trim() !== '' || Number(i.quantity) > 0 || Number(i.rate) > 0);

  return (
    <div className="main-content">
      <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Invoice Preview</h1>
      </div>
      
      <div className="hide-on-print">
        <InvoiceStepper currentStep={4} />
      </div>

      <div className="form-actions hide-on-print" style={{ marginTop: 0, marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/summary')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Summary
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {company && (
            <button 
              className="btn btn-secondary" 
              onClick={handleSaveToCloud} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: savingStatus === 'saved' ? '#166534' : undefined, color: savingStatus === 'saved' ? 'white' : undefined }}
              disabled={savingStatus === 'saving'}
            >
              <Cloud size={16} /> 
              {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'saved' ? 'Saved' : 'Save to Cloud'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="invoice-preview-container">
        <div className="invoice-page" ref={invoiceRef}>
          <div 
            className="invoice-scale-wrapper" 
            ref={contentWrapperRef}
            style={{ transform: `scale(${scale})` }}
          >
            {/* Company Details */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ margin: 0, fontSize: '18pt' }}>{invoice.company.name || 'COMPANY NAME'}</h1>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: '5px' }}>{invoice.company.address}</div>
              {invoice.company.gstNumber && <div><strong>GST NO:</strong> {invoice.company.gstNumber}</div>}
              <div style={{ marginTop: '5px' }}>
                {invoice.company.email && <span style={{ marginRight: '15px' }}><strong>Email:</strong> {invoice.company.email}</span>}
                {invoice.company.phone && <span><strong>Phone:</strong> {invoice.company.phone}</span>}
              </div>
              {invoice.company.state && <div><strong>State:</strong> {invoice.company.state} {invoice.company.stateCode ? `(${invoice.company.stateCode})` : ''}</div>}
            </div>

            <div className="invoice-title">PROFORMA INVOICE</div>

            <div className="invoice-header-grid">
              {/* Buyer Details */}
              <div className="invoice-section">
                <div className="invoice-section-title">To / Buyer Details</div>
                <strong style={{ display: 'block', marginBottom: '5px', fontSize: '12pt' }}>{invoice.buyer.name || 'Buyer Name'}</strong>
                <div style={{ whiteSpace: 'pre-wrap', marginBottom: '5px' }}>{invoice.buyer.address}</div>
                {invoice.buyer.gstNumber && <div><strong>GST NO:</strong> {invoice.buyer.gstNumber}</div>}
                {invoice.buyer.email && <div><strong>Email:</strong> {invoice.buyer.email}</div>}
                {invoice.buyer.phone && <div><strong>Phone:</strong> {invoice.buyer.phone}</div>}
                {invoice.buyer.state && <div><strong>State:</strong> {invoice.buyer.state} {invoice.buyer.stateCode ? `(${invoice.buyer.stateCode})` : ''}</div>}
              </div>

              {/* PI Info */}
              <div className="invoice-section">
                <div className="invoice-section-title">Invoice Information</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '2px 0', width: '40%' }}><strong>PI NO:</strong></td>
                      <td style={{ padding: '2px 0' }}>{invoice.invoice.piNumber}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '2px 0' }}><strong>PI Date:</strong></td>
                      <td style={{ padding: '2px 0' }}>
                        {invoice.invoice.piDate ? new Date(invoice.invoice.piDate).toLocaleDateString('en-IN') : ''}
                      </td>
                    </tr>
                    {invoice.invoice.validUntil && (
                      <tr>
                        <td style={{ padding: '2px 0' }}><strong>Valid Until:</strong></td>
                        <td style={{ padding: '2px 0' }}>
                          {new Date(invoice.invoice.validUntil).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    )}
                    {invoice.invoice.placeOfSupply && (
                      <tr>
                        <td style={{ padding: '2px 0' }}><strong>Place of Supply:</strong></td>
                        <td style={{ padding: '2px 0' }}>{invoice.invoice.placeOfSupply}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ margin: '15px 0' }}>
              <div><strong>Dear Sir,</strong></div>
              <div style={{ marginTop: '5px' }}>Proforma invoice for the following items:</div>
            </div>

            {/* Items Table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>S.No.</th>
                  <th style={{ width: '25%' }}>Particulars</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Qty/sq ft</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Unit Price in INR</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>TOTAL AMOUNT</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>SGST RATE @ {invoice.gst.sgstRate}%</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>CGST RATE @ {invoice.gst.cgstRate}%</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Total amount in INR</th>
                </tr>
              </thead>
              <tbody>
                {activeItems.map((item, index) => {
                  const amount = calculateItemAmount(Number(item.quantity) || 0, Number(item.rate) || 0);
                  const sgst = calculateItemSgst(amount, invoice.gst.sgstRate);
                  const cgst = calculateItemCgst(amount, invoice.gst.cgstRate);
                  const total = calculateItemTotal(amount, sgst, cgst);

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{item.description}</td>
                      <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(Number(item.rate))}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(amount)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(sgst)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(cgst)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
                
                {/* Totals Rows */}
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px' }}>Total Amount</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px' }}>{formatCurrency(taxableTotal)}</td>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', padding: '6px' }}>SGST @ {invoice.gst.sgstRate}%</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatCurrency(totalSgst)}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', padding: '6px' }}>CGST @ {invoice.gst.cgstRate}%</td>
                  <td colSpan={1}></td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{formatCurrency(totalCgst)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px' }}>Total Before Round Off</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '6px' }}>{formatCurrency(totalBeforeRoundOff)}</td>
                </tr>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'right', padding: '6px' }}>Round Off</td>
                  <td style={{ textAlign: 'right', padding: '6px' }}>{roundOff < 0 ? '-' : '+'}{formatCurrency(Math.abs(roundOff))}</td>
                </tr>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '11pt', padding: '8px' }}>GRAND TOTAL</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '11pt', padding: '8px' }}>{formatCurrency(grandTotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* Amount in Words */}
            <div style={{ margin: '15px 0', border: '1px solid #000', padding: '8px' }}>
              <strong>Amount in Words: </strong>
              <span>{convertNumberToWords(grandTotal)}</span>
            </div>

            <div className="invoice-header-grid">
              {/* Bank Details */}
              {invoice.additionalDetails.bank && (invoice.additionalDetails.bank.bankName || invoice.additionalDetails.bank.accountNumber) && (
                <div className="invoice-section">
                  <div className="invoice-section-title">Bank Details</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {invoice.additionalDetails.bank.bankName && (
                        <tr>
                          <td style={{ padding: '1px 0', width: '40%' }}><strong>Bank Name:</strong></td>
                          <td style={{ padding: '1px 0' }}>{invoice.additionalDetails.bank.bankName}</td>
                        </tr>
                      )}
                      {invoice.additionalDetails.bank.accountName && (
                        <tr>
                          <td style={{ padding: '1px 0' }}><strong>Account Name:</strong></td>
                          <td style={{ padding: '1px 0' }}>{invoice.additionalDetails.bank.accountName}</td>
                        </tr>
                      )}
                      {invoice.additionalDetails.bank.accountNumber && (
                        <tr>
                          <td style={{ padding: '1px 0' }}><strong>Account No:</strong></td>
                          <td style={{ padding: '1px 0' }}>{invoice.additionalDetails.bank.accountNumber}</td>
                        </tr>
                      )}
                      {invoice.additionalDetails.bank.ifsc && (
                        <tr>
                          <td style={{ padding: '1px 0' }}><strong>IFSC Code:</strong></td>
                          <td style={{ padding: '1px 0' }}>{invoice.additionalDetails.bank.ifsc}</td>
                        </tr>
                      )}
                      {invoice.additionalDetails.bank.branch && (
                        <tr>
                          <td style={{ padding: '1px 0' }}><strong>Branch:</strong></td>
                          <td style={{ padding: '1px 0' }}>{invoice.additionalDetails.bank.branch}</td>
                        </tr>
                      )}
                      {invoice.additionalDetails.bank.accountType && (
                        <tr>
                          <td style={{ padding: '1px 0' }}><strong>Account Type:</strong></td>
                          <td style={{ padding: '1px 0' }}>{invoice.additionalDetails.bank.accountType}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Payment Details */}
                {invoice.additionalDetails.paymentTerms && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Payment Terms</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '8.5pt' }}>{invoice.additionalDetails.paymentTerms}</div>
                  </div>
                )}

                {/* Delivery Dates */}
                {invoice.additionalDetails.deliveryDates && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Delivery Dates</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '8.5pt' }}>{invoice.additionalDetails.deliveryDates}</div>
                  </div>
                )}

                {/* Notes */}
                {invoice.additionalDetails.notes && (
                  <div className="invoice-section">
                    <div className="invoice-section-title">Notes / Remarks</div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '8.5pt' }}>{invoice.additionalDetails.notes}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            {invoice.additionalDetails.termsAndConditions && (
              <div className="invoice-section" style={{ marginBottom: '20px' }}>
                <div className="invoice-section-title">Terms & Conditions</div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '8.5pt' }}>
                  {invoice.additionalDetails.termsAndConditions}
                </div>
              </div>
            )}

            {/* Signature Area */}
            <div className="signature-section">
              <div className="customer-signature">
                <div className="signature-label">
                  Customer's Seal and Signature
                </div>
              </div>

              <div className="company-signature">
                <div className="company-authorized">
                  for {invoice.company.name || 'COMPANY NAME'}
                </div>

                <div className="authorized-label">
                  Authorised Signatory
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
