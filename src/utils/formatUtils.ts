/**
 * Format a number as currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export { formatCurrency }; 