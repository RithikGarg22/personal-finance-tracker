/**
 * CSV utility functions for importing and exporting transactions and budgets
 */

import type { Transaction, Budget } from '../types';
import { isValidDate, isValidMonth } from './dateUtils';

/**
 * Error class for CSV parsing errors
 */
export class CSVParseError extends Error {
  row?: number;
  field?: string;
  
  constructor(
    message: string,
    row?: number,
    field?: string
  ) {
    super(message);
    this.name = 'CSVParseError';
    this.row = row;
    this.field = field;
  }
}

/**
 * Validates a number string and returns the parsed number
 */
function parseNumber(value: string, fieldName: string, row: number): number {
  const trimmed = value.trim();
  const num = Number(trimmed);
  
  if (isNaN(num)) {
    throw new CSVParseError(
      `Invalid number format for ${fieldName}`,
      row,
      fieldName
    );
  }
  
  return num;
}

/**
 * Escapes a field value for CSV format
 */
function escapeCSVField(value: string): string {
  // If the value contains comma, newline, or double quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape double quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parses a CSV line, handling quoted fields properly
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField);
  
  return fields;
}

/**
 * Parses a CSV string into an array of Transaction objects
 * @param csvContent - The CSV content as a string
 * @returns Array of Transaction objects
 * @throws CSVParseError if the CSV is invalid
 */
export function parseTransactionsCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    throw new CSVParseError('CSV file is empty');
  }
  
  // Parse header
  const headerFields = parseCSVLine(lines[0]);
  
  // Validate headers (case-insensitive)
  const normalizedHeaders = headerFields.map(h => h.trim().toLowerCase());
  const requiredHeaders = ['date', 'amount', 'category'];
  
  for (const required of requiredHeaders) {
    if (!normalizedHeaders.includes(required)) {
      throw new CSVParseError(`Missing required header: ${required}`);
    }
  }
  
  // Get header indices
  const dateIndex = normalizedHeaders.indexOf('date');
  const amountIndex = normalizedHeaders.indexOf('amount');
  const categoryIndex = normalizedHeaders.indexOf('category');
  const notesIndex = normalizedHeaders.indexOf('notes');
  
  const transactions: Transaction[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const fields = parseCSVLine(line);
    const rowNumber = i + 1;
    
    // Validate field count
    if (fields.length < requiredHeaders.length) {
      throw new CSVParseError(
        `Insufficient fields (expected at least ${requiredHeaders.length}, got ${fields.length})`,
        rowNumber
      );
    }
    
    // Extract and validate fields
    const date = fields[dateIndex]?.trim();
    if (!date) {
      throw new CSVParseError('Date is required', rowNumber, 'date');
    }
    if (!isValidDate(date)) {
      throw new CSVParseError(
        'Invalid date format (expected YYYY-MM-DD)',
        rowNumber,
        'date'
      );
    }
    
    const amountStr = fields[amountIndex]?.trim();
    if (!amountStr) {
      throw new CSVParseError('Amount is required', rowNumber, 'amount');
    }
    const amount = parseNumber(amountStr, 'amount', rowNumber);
    
    const category = fields[categoryIndex]?.trim();
    if (!category) {
      throw new CSVParseError('Category is required', rowNumber, 'category');
    }
    if (category.length > 50) {
      throw new CSVParseError(
        'Category exceeds maximum length of 50 characters',
        rowNumber,
        'category'
      );
    }
    
    const notes = notesIndex >= 0 ? fields[notesIndex]?.trim() : undefined;
    if (notes && notes.length > 500) {
      throw new CSVParseError(
        'Notes exceed maximum length of 500 characters',
        rowNumber,
        'notes'
      );
    }
    
    transactions.push({
      id: crypto.randomUUID(),
      date,
      amount,
      category,
      notes: notes || undefined,
    });
  }
  
  return transactions;
}

/**
 * Parses a CSV string into an array of Budget objects
 * @param csvContent - The CSV content as a string
 * @returns Array of Budget objects
 * @throws CSVParseError if the CSV is invalid
 */
export function parseBudgetsCSV(csvContent: string): Budget[] {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length === 0) {
    throw new CSVParseError('CSV file is empty');
  }
  
  // Parse header
  const headerFields = parseCSVLine(lines[0]);
  const expectedHeaders = ['month', 'category', 'limit'];
  
  // Validate headers (case-insensitive)
  const normalizedHeaders = headerFields.map(h => h.trim().toLowerCase());
  
  for (const required of expectedHeaders) {
    if (!normalizedHeaders.includes(required)) {
      throw new CSVParseError(`Missing required header: ${required}`);
    }
  }
  
  // Get header indices
  const monthIndex = normalizedHeaders.indexOf('month');
  const categoryIndex = normalizedHeaders.indexOf('category');
  const limitIndex = normalizedHeaders.indexOf('limit');
  
  const budgets: Budget[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const fields = parseCSVLine(line);
    const rowNumber = i + 1;
    
    // Validate field count
    if (fields.length < expectedHeaders.length) {
      throw new CSVParseError(
        `Insufficient fields (expected ${expectedHeaders.length}, got ${fields.length})`,
        rowNumber
      );
    }
    
    // Extract and validate fields
    const month = fields[monthIndex]?.trim();
    if (!month) {
      throw new CSVParseError('Month is required', rowNumber, 'month');
    }
    if (!isValidMonth(month)) {
      throw new CSVParseError(
        'Invalid month format (expected YYYY-MM)',
        rowNumber,
        'month'
      );
    }
    
    const category = fields[categoryIndex]?.trim();
    if (!category) {
      throw new CSVParseError('Category is required', rowNumber, 'category');
    }
    if (category.length > 50) {
      throw new CSVParseError(
        'Category exceeds maximum length of 50 characters',
        rowNumber,
        'category'
      );
    }
    
    const limitStr = fields[limitIndex]?.trim();
    if (!limitStr) {
      throw new CSVParseError('Limit is required', rowNumber, 'limit');
    }
    const limit = parseNumber(limitStr, 'limit', rowNumber);
    
    if (limit <= 0) {
      throw new CSVParseError(
        'Limit must be a positive number',
        rowNumber,
        'limit'
      );
    }
    
    budgets.push({
      id: crypto.randomUUID(),
      month,
      category,
      limit,
    });
  }
  
  return budgets;
}

/**
 * Generates a CSV string from an array of Transaction objects
 * @param transactions - Array of Transaction objects
 * @returns CSV string
 */
export function generateTransactionsCSV(transactions: Transaction[]): string {
  const headers = ['date', 'amount', 'category', 'notes'];
  const lines = [headers.join(',')];
  
  for (const transaction of transactions) {
    const fields = [
      transaction.date,
      transaction.amount.toString(),
      escapeCSVField(transaction.category),
      escapeCSVField(transaction.notes || ''),
    ];
    lines.push(fields.join(','));
  }
  
  return lines.join('\n');
}

/**
 * Generates a CSV string from an array of Budget objects
 * @param budgets - Array of Budget objects
 * @returns CSV string
 */
export function generateBudgetsCSV(budgets: Budget[]): string {
  const headers = ['month', 'category', 'limit'];
  const lines = [headers.join(',')];
  
  for (const budget of budgets) {
    const fields = [
      budget.month,
      escapeCSVField(budget.category),
      budget.limit.toString(),
    ];
    lines.push(fields.join(','));
  }
  
  return lines.join('\n');
}
