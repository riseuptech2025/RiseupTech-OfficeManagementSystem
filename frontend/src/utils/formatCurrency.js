// utils/formatCurrency.js
export const formatCurrency = (amount, currency = 'NPR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Alternative without currency symbol
export const formatCurrencyWithoutSymbol = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Convert to words (if needed)
export const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (num) => {
    if (num === 0) return 'Zero';
    let words = '';
    if (num >= 1000000) {
      words += inWords(Math.floor(num / 1000000)) + ' Million ';
      num %= 1000000;
    }
    if (num >= 1000) {
      words += inWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    if (num >= 100) {
      words += inWords(Math.floor(num / 100)) + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      words += b[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      words += a[num] + ' ';
    }
    return words.trim();
  };

  const rupees = Math.floor(num);
  const paisa = Math.round((num - rupees) * 100);
  let result = inWords(rupees);
  if (paisa > 0) {
    result += ' and ' + inWords(paisa) + ' Paisa';
  }
  return result + ' Nepalese Rupees Only.';
};