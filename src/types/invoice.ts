export interface Company {
  name: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
  state: string;
  stateCode: string;
}

export interface Buyer {
  name: string;
  address: string;
  gstNumber: string;
  email: string;
  phone: string;
  state: string;
  stateCode: string;
}

export interface InvoiceInfo {
  piNumber: string;
  piDate: string;
  validUntil: string;
  placeOfSupply: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface AdditionalDetails {
  bank: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
    accountType: string;
  };
  paymentTerms: string;
  deliveryDates: string;
  termsAndConditions: string;
  notes: string;
}

export interface Invoice {
  company: Company;
  buyer: Buyer;
  invoice: InvoiceInfo;
  items: InvoiceItem[];
  gst: {
    sgstRate: number;
    cgstRate: number;
  };
  totals: {
    subtotal: number;
    sgst: number;
    cgst: number;
    roundOff: number;
    grandTotal: number;
  };
  additionalDetails: AdditionalDetails;
}

export const initialInvoice: Invoice = {
  company: {
    name: "",
    address: "",
    gstNumber: "",
    email: "",
    phone: "",
    state: "",
    stateCode: ""
  },
  buyer: {
    name: "",
    address: "",
    gstNumber: "",
    email: "",
    phone: "",
    state: "",
    stateCode: ""
  },
  invoice: {
    piNumber: "",
    piDate: new Date().toISOString().split('T')[0],
    validUntil: "",
    placeOfSupply: ""
  },
  items: [],
  gst: {
    sgstRate: 2.5,
    cgstRate: 2.5
  },
  totals: {
    subtotal: 0,
    sgst: 0,
    cgst: 0,
    roundOff: 0,
    grandTotal: 0
  },
  additionalDetails: {
    bank: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
      accountType: ""
    },
    paymentTerms: "",
    deliveryDates: "",
    termsAndConditions: "",
    notes: ""
  }
};
