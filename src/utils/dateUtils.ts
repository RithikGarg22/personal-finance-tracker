/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Get the current month in YYYY-MM format
 * @returns Current month string
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the current date in YYYY-MM-DD format
 * @returns Current date string
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string for display
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param locale - Optional locale string (defaults to 'en-US')
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  if (!dateString) return '';
  
  try {
    // Parse date string and add time to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00');
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return dateString;
    }
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a date string for display with long month name
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param locale - Optional locale string (defaults to 'en-US')
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateLong(dateString: string, locale: string = 'en-US'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return dateString;
    }
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format a month string for display
 * @param monthString - Month string in YYYY-MM format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @returns Formatted month string (e.g., "January 2025") or empty string if invalid
 */
export function formatMonth(monthString: string, locale: string = 'en-US'): string {
  if (!monthString) return '';
  
  try {
    const parts = monthString.split('-');
    if (parts.length !== 2) {
      console.warn(`Invalid month string format: ${monthString}`);
      return monthString;
    }
    
    const [year, month] = parts;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // Validate year and month
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.warn(`Invalid month values: ${monthString}`);
      return monthString;
    }
    
    const date = new Date(yearNum, monthNum - 1, 1);
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
    }).format(date);
  } catch (error) {
    console.error('Error formatting month:', error);
    return monthString;
  }
}

/**
 * Format a month string for display with short month name
 * @param monthString - Month string in YYYY-MM format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @returns Formatted month string (e.g., "Jan 2025") or empty string if invalid
 */
export function formatMonthShort(monthString: string, locale: string = 'en-US'): string {
  if (!monthString) return '';
  
  try {
    const parts = monthString.split('-');
    if (parts.length !== 2) {
      console.warn(`Invalid month string format: ${monthString}`);
      return monthString;
    }
    
    const [year, month] = parts;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.warn(`Invalid month values: ${monthString}`);
      return monthString;
    }
    
    const date = new Date(yearNum, monthNum - 1, 1);
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
    }).format(date);
  } catch (error) {
    console.error('Error formatting month:', error);
    return monthString;
  }
}

/**
 * Parse a date string and return a Date object
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Check if a date string is valid
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns True if valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
}

/**
 * Check if a month string is valid
 * @param monthString - Month string in YYYY-MM format
 * @returns True if valid, false otherwise
 */
export function isValidMonth(monthString: string): boolean {
  if (!monthString) return false;
  
  const parts = monthString.split('-');
  if (parts.length !== 2) return false;
  
  const [year, month] = parts;
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  return !isNaN(yearNum) && !isNaN(monthNum) && monthNum >= 1 && monthNum <= 12;
}

/**
 * Get the month string from a date string
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Month string in YYYY-MM format or empty string if invalid
 */
export function getMonthFromDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const parts = dateString.split('-');
    if (parts.length < 2) return '';
    
    return `${parts[0]}-${parts[1]}`;
  } catch (error) {
    console.error('Error extracting month from date:', error);
    return '';
  }
}

/**
 * Compare two date strings
 * @param date1 - First date string (YYYY-MM-DD)
 * @param date2 - Second date string (YYYY-MM-DD)
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2, null if invalid
 */
export function compareDates(date1: string, date2: string): number | null {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!d1 || !d2) return null;
  
  const time1 = d1.getTime();
  const time2 = d2.getTime();
  
  if (time1 < time2) return -1;
  if (time1 > time2) return 1;
  return 0;
}

/**
 * Get a list of months between two dates
 * @param startMonth - Start month in YYYY-MM format
 * @param endMonth - End month in YYYY-MM format
 * @returns Array of month strings in YYYY-MM format
 */
export function getMonthsBetween(startMonth: string, endMonth: string): string[] {
  if (!isValidMonth(startMonth) || !isValidMonth(endMonth)) {
    return [];
  }
  
  const months: string[] = [];
  const [startYear, startMonthNum] = startMonth.split('-').map(Number);
  const [endYear, endMonthNum] = endMonth.split('-').map(Number);
  
  let currentYear = startYear;
  let currentMonth = startMonthNum;
  
  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonthNum)) {
    const monthStr = String(currentMonth).padStart(2, '0');
    months.push(`${currentYear}-${monthStr}`);
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  
  return months;
}
