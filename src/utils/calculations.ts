export const calculateItemAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

export const calculateItemSgst = (amount: number, sgstRate: number): number => {
  return amount * (sgstRate / 100);
};

export const calculateItemCgst = (amount: number, cgstRate: number): number => {
  return amount * (cgstRate / 100);
};

export const calculateItemTotal = (amount: number, sgst: number, cgst: number): number => {
  return amount + sgst + cgst;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const calculateTaxableTotal = (items: { quantity: number; rate: number }[]): number => {
  return items.reduce((sum, item) => sum + calculateItemAmount(Number(item.quantity) || 0, Number(item.rate) || 0), 0);
};

export const calculateTotalSgst = (items: { quantity: number; rate: number }[], sgstRate: number): number => {
  return items.reduce((sum, item) => {
    const amount = calculateItemAmount(Number(item.quantity) || 0, Number(item.rate) || 0);
    return sum + calculateItemSgst(amount, sgstRate);
  }, 0);
};

export const calculateTotalCgst = (items: { quantity: number; rate: number }[], cgstRate: number): number => {
  return items.reduce((sum, item) => {
    const amount = calculateItemAmount(Number(item.quantity) || 0, Number(item.rate) || 0);
    return sum + calculateItemCgst(amount, cgstRate);
  }, 0);
};

export const calculateGrandTotal = (taxableTotal: number, totalSgst: number, totalCgst: number): number => {
  return taxableTotal + totalSgst + totalCgst;
};

export const calculateRoundOff = (amount: number): number => {
  const rounded = Math.round(amount);
  return rounded - amount;
};
