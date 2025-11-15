/**
 * Utility functions for formatting numbers and currency
 */

/**
 * Format a number as currency (USD)
 * @param amount - The amount to format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @param currency - Optional currency code (defaults to 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  // Handle edge cases
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn(`Invalid amount for currency formatting: ${amount}`);
    return '$0.00';
  }
  
  // Handle infinity
  if (!isFinite(amount)) {
    return amount > 0 ? '$∞' : '-$∞';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format a number with commas
 * @param value - The number to format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @param decimals - Optional number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  decimals?: number
): string {
  // Handle edge cases
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`Invalid value for number formatting: ${value}`);
    return '0';
  }
  
  // Handle infinity
  if (!isFinite(value)) {
    return value > 0 ? '∞' : '-∞';
  }
  
  try {
    const options: Intl.NumberFormatOptions = {};
    
    if (decimals !== undefined) {
      options.minimumFractionDigits = decimals;
      options.maximumFractionDigits = decimals;
    }
    
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return decimals !== undefined ? value.toFixed(decimals) : value.toString();
  }
}

/**
 * Format a number as a percentage
 * @param value - The value to format (e.g., 0.75 for 75%)
 * @param locale - Optional locale string (defaults to 'en-US')
 * @param decimals - Optional number of decimal places (defaults to 0)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  locale: string = 'en-US',
  decimals: number = 0
): string {
  // Handle edge cases
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`Invalid value for percentage formatting: ${value}`);
    return '0%';
  }
  
  // Handle infinity
  if (!isFinite(value)) {
    return value > 0 ? '∞%' : '-∞%';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Format a number with compact notation (e.g., 1.2K, 3.4M)
 * @param value - The number to format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @param decimals - Optional number of decimal places (defaults to 1)
 * @returns Formatted compact number string
 */
export function formatCompactNumber(
  value: number,
  locale: string = 'en-US',
  decimals: number = 1
): string {
  // Handle edge cases
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`Invalid value for compact number formatting: ${value}`);
    return '0';
  }
  
  // Handle infinity
  if (!isFinite(value)) {
    return value > 0 ? '∞' : '-∞';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.error('Error formatting compact number:', error);
    // Fallback to manual compact formatting
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    
    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
    } else if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
    } else if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
  }
}

/**
 * Parse a currency string to a number
 * @param currencyString - Currency string (e.g., "$1,234.56")
 * @returns Parsed number or null if invalid
 */
export function parseCurrency(currencyString: string): number | null {
  if (!currencyString || typeof currencyString !== 'string') {
    return null;
  }
  
  try {
    // Remove currency symbols, commas, and spaces
    const cleaned = currencyString.replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return null;
  }
}

/**
 * Format a number as currency with sign (always show + or -)
 * @param amount - The amount to format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @param currency - Optional currency code (defaults to 'USD')
 * @returns Formatted currency string with sign
 */
export function formatCurrencyWithSign(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  const formatted = formatCurrency(amount, locale, currency);
  
  if (amount > 0) {
    return `+${formatted}`;
  }
  
  return formatted;
}

/**
 * Format a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param value - The number to format
 * @returns Number with ordinal suffix
 */
export function formatOrdinal(value: number): string {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return value.toString();
  }
  
  const int = Math.floor(Math.abs(value));
  const lastDigit = int % 10;
  const lastTwoDigits = int % 100;
  
  // Special cases for 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${value}th`;
  }
  
  switch (lastDigit) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}
