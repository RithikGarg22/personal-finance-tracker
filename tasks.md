# Implementation Plan

- [x] 1. Initialize project structure and dependencies





  - Create Vite + React + TypeScript project with `npm create vite@latest`
  - Install dependencies: `idb`, `recharts`, `react-router-dom`, `tailwindcss`
  - Install dev dependencies: `vitest`, `@playwright/test`, `fake-indexeddb`, `@testing-library/react`
  - Configure Tailwind CSS with PostCSS
  - Set up TypeScript configuration for strict mode
  - Create project folder structure (components, services, storage, types, utils)
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Define TypeScript types and interfaces





  - Create `types/index.ts` with Transaction, Budget, BudgetWithRemaining, CategoryTotal, and SpendingOverTime interfaces
  - Define StorageAdapter interface for generic CRUD operations
  - Export all types for use across the application
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 3. Implement IndexedDB storage adapter




  - [x] 3.1 Create IndexedDBAdapter class in `storage/indexeddb.ts`


    - Implement database initialization with proper schema (transactions and budgets stores)
    - Create indexes for date, category, and compound [month, category]
    - Implement add() method with UUID generation
    - Implement getAll() method with proper error handling
    - Implement getById() method
    - Implement update() method
    - Implement delete() method
    - Create factory functions: createTransactionStorage() and createBudgetStorage()
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ]* 3.2 Write unit tests for IndexedDB adapter
    - Set up fake-indexeddb for testing environment
    - Test CRUD operations for transactions
    - Test CRUD operations for budgets
    - Test error handling scenarios (quota exceeded, database unavailable)
    - Test index queries
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 4. Implement calculation service





  - [x] 4.1 Create CalculationService class in `services/calculationService.ts`


    - Implement calculateTotalBalance() to sum all transaction amounts
    - Implement calculateMonthlySpending() to sum transactions for a specific month
    - Implement calculateCategoryTotals() to aggregate spending by category
    - Implement calculateSpendingOverTime() with grouping by day/week/month
    - Implement calculateBudgetRemaining() to compute budget minus spending
    - _Requirements: 6.1, 7.1, 8.2, 9.2, 5.1_
  - [ ]* 4.2 Write unit tests for calculation service
    - Test calculateTotalBalance with empty, single, and multiple transactions
    - Test calculateMonthlySpending with various date ranges
    - Test calculateCategoryTotals with multiple categories
    - Test calculateSpendingOverTime with different grouping options
    - Test calculateBudgetRemaining with no spending, partial spending, and overspending
    - Test edge cases: zero amounts, negative amounts, boundary dates
    - _Requirements: 15.1, 15.2, 15.3, 16.1, 16.2, 16.3_

- [x] 5. Implement transaction service




  - [x] 5.1 Create TransactionService class in `services/transactionService.ts`


    - Inject StorageAdapter<Transaction> dependency
    - Implement addTransaction() with validation
    - Implement updateTransaction() with validation
    - Implement deleteTransaction()
    - Implement getAllTransactions()
    - Implement getTransactionsByMonth() helper
    - Implement getTransactionsByCategory() helper
    - Add input validation for date, amount, category, and notes fields
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.4, 3.1_
  - [ ]* 5.2 Write unit tests for transaction service
    - Test addTransaction with valid and invalid data
    - Test updateTransaction with partial updates
    - Test deleteTransaction
    - Test query methods (getTransactionsByMonth, getTransactionsByCategory)
    - Test validation error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.4, 3.1_

- [x] 6. Implement budget service




  - [x] 6.1 Create BudgetService class in `services/budgetService.ts`


    - Inject StorageAdapter<Budget> and TransactionService dependencies
    - Implement addBudget() with validation and duplicate prevention
    - Implement updateBudget() with validation
    - Implement deleteBudget()
    - Implement getAllBudgets()
    - Implement getBudgetWithRemaining() using CalculationService
    - Implement getAllBudgetsWithRemaining()
    - Add input validation for month, category, and limit fields
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_
  - [ ]* 6.2 Write unit tests for budget service
    - Test addBudget with valid and invalid data
    - Test duplicate budget prevention
    - Test updateBudget
    - Test deleteBudget
    - Test getBudgetWithRemaining calculation accuracy
    - Test getAllBudgetsWithRemaining with multiple budgets
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4_

- [x] 7. Implement CSV utilities




  - [x] 7.1 Create CSV utility functions in `utils/csv.ts`


    - Implement parseTransactionsCSV() to parse CSV string into Transaction objects
    - Implement parseBudgetsCSV() to parse CSV string into Budget objects
    - Implement generateTransactionsCSV() to convert Transaction array to CSV string
    - Implement generateBudgetsCSV() to convert Budget array to CSV string
    - Add validation for CSV format and data types
    - Handle edge cases: empty files, malformed rows, missing headers
    - _Requirements: 11.1, 11.2, 11.4, 12.1, 12.2, 12.4, 12.5_
  - [ ]* 7.2 Write unit tests for CSV utilities
    - Test parsing valid CSV files
    - Test parsing invalid CSV files with error reporting
    - Test CSV generation with various data sets
    - Test edge cases: empty data, special characters, commas in notes
    - _Requirements: 11.1, 11.2, 11.4, 12.1, 12.2, 12.4, 12.5_

- [x] 8. Set up routing and layout





  - Create App.tsx with React Router setup
  - Define routes: `/` (Dashboard), `/transactions`, `/budgets`, `/settings`
  - Create Layout.tsx component with navigation and content area
  - Create Navigation.tsx with responsive menu (hamburger on mobile, sidebar on desktop)
  - Implement route-based navigation with active state indicators
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 9. Implement common components





  - Create ConfirmDialog.tsx for delete confirmations
  - Add keyboard navigation support (Escape to close, Enter to confirm)
  - Add ARIA labels and roles for accessibility
  - Style with Tailwind for responsive design
  - _Requirements: 3.3, 14.1, 14.2, 14.4_

- [x] 10. Implement transaction management UI




  - [x] 10.1 Create TransactionForm component


    - Add form fields: date (HTML5 date input), amount (number input), category (select/input), notes (textarea)
    - Implement form validation with inline error messages
    - Support both add and edit modes
    - Add submit and cancel buttons
    - Style with Tailwind for responsive layout
    - Add ARIA labels and error announcements
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.4, 14.1, 14.2, 14.4_
  - [x] 10.2 Create TransactionItem component


    - Display transaction date, amount, category, and notes
    - Add edit and delete action buttons
    - Format amount as currency
    - Add confirmation dialog for delete action
    - Style with Tailwind, ensure 44px minimum touch targets
    - _Requirements: 1.5, 2.3, 3.1, 3.2, 3.3, 13.2_
  - [x] 10.3 Create TransactionList component


    - Fetch and display all transactions using TransactionService
    - Implement sort options (by date, amount, category)
    - Add filter by category
    - Integrate TransactionItem for each transaction
    - Show empty state when no transactions exist
    - Handle loading and error states
    - _Requirements: 1.5, 2.3, 3.2, 10.3_
  - [x] 10.4 Create Transactions page


    - Combine TransactionList and TransactionForm
    - Add "Add Transaction" button to show form
    - Handle form submission and list refresh
    - Ensure UI updates within 500ms of data changes
    - _Requirements: 1.5, 2.3, 3.2_

- [x] 11. Implement budget management UI





  - [x] 11.1 Create BudgetForm component


    - Add form fields: month (HTML5 month input), category (select/input), limit (number input)
    - Implement form validation with inline error messages
    - Support both add and edit modes
    - Prevent duplicate month/category combinations
    - Add submit and cancel buttons
    - Style with Tailwind for responsive layout
    - Add ARIA labels
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 14.1, 14.2_
  - [x] 11.2 Create BudgetItem component


    - Display budget month, category, limit, spent, and remaining amounts
    - Add progress bar showing spent vs. limit
    - Highlight over-budget with visual indicator (red color)
    - Add edit and delete action buttons
    - Format amounts as currency
    - Style with Tailwind
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 11.3 Create BudgetList component


    - Fetch and display all budgets with remaining amounts using BudgetService
    - Integrate BudgetItem for each budget
    - Show empty state when no budgets exist
    - Handle loading and error states
    - Ensure UI updates within 500ms of data changes
    - _Requirements: 5.2, 5.3_
  - [x] 11.4 Create Budgets page


    - Combine BudgetList and BudgetForm
    - Add "Add Budget" button to show form
    - Handle form submission and list refresh
    - _Requirements: 4.1, 5.2_

- [x] 12. Implement dashboard components




  - [x] 12.1 Create BalanceCard component


    - Fetch all transactions using TransactionService
    - Calculate total balance using CalculationService
    - Display formatted balance with currency symbol
    - Style as card with Tailwind
    - Handle loading state
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 12.2 Create MonthlySpendingCard component


    - Fetch transactions for current month
    - Calculate monthly spending using CalculationService
    - Display formatted spending amount
    - Style as card with Tailwind
    - Handle loading state
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 12.3 Create CategoryPieChart component


    - Fetch all transactions
    - Calculate category totals using CalculationService
    - Render Recharts PieChart with category data
    - Add legend with category names and amounts
    - Add tooltip on hover
    - Use color palette for different categories
    - Make responsive (adjust size based on viewport)
    - Ensure chart updates within 1 second of data changes
    - Add ARIA label for accessibility
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 14.2_
  - [x] 12.4 Create SpendingLineChart component


    - Fetch all transactions
    - Calculate spending over time using CalculationService (default to monthly grouping)
    - Render Recharts LineChart with time series data
    - Add XAxis (dates), YAxis (amounts), CartesianGrid, Tooltip
    - Make responsive (adjust size based on viewport)
    - Ensure chart updates within 1 second of data changes
    - Add ARIA label for accessibility
    - _Requirements: 9.1, 9.2, 9.3, 14.2_
  - [x] 12.5 Create Dashboard page


    - Arrange BalanceCard, MonthlySpendingCard, CategoryPieChart, and SpendingLineChart
    - Use responsive grid layout (stacked on mobile, multi-column on desktop)
    - Implement React.memo() for chart components to optimize re-renders
    - Handle loading states for all components
    - _Requirements: 6.2, 7.2, 8.1, 9.1, 13.1, 13.3_

- [x] 13. Implement CSV import/export UI




  - [x] 13.1 Create ExportCSV component


    - Add "Export Transactions" button
    - Add "Export Budgets" button
    - Fetch data from services
    - Generate CSV using csv utility
    - Trigger browser download with proper filename
    - Show success message after export
    - Handle errors gracefully
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 13.2 Create ImportCSV component


    - Add file input for CSV upload (accept=".csv")
    - Add separate import options for transactions and budgets
    - Parse CSV using csv utility
    - Validate all rows before importing
    - Display preview of data to be imported
    - Show validation errors with row numbers
    - Import valid data to storage on confirmation
    - Display success/failure summary
    - Handle errors with clear messages
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [x] 13.3 Create Settings page


    - Integrate ExportCSV and ImportCSV components
    - Add section headers and descriptions
    - Style with Tailwind
    - _Requirements: 11.1, 12.1_

- [x] 14. Implement error handling and boundaries





  - Create React Error Boundary component
  - Add error boundary to App.tsx wrapping main content
  - Implement error handling in all service methods
  - Display user-friendly error messages in UI
  - Add retry mechanisms for transient errors
  - Log errors to console for debugging
  - _Requirements: All requirements benefit from proper error handling_

- [x] 15. Implement accessibility features





  - Add skip navigation link in Layout
  - Ensure all forms have proper labels and error associations
  - Add ARIA live regions for dynamic updates (transaction added, budget updated)
  - Verify keyboard navigation works for all interactive elements
  - Test focus management in modals and dialogs
  - Verify color contrast ratios meet WCAG 2.1 AA standards
  - Add focus indicators to all interactive elements
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 16. Implement responsive design





  - Configure Tailwind breakpoints (mobile < 640px, tablet 640-1024px, desktop > 1024px)
  - Implement hamburger menu for mobile navigation
  - Make all forms responsive with proper input sizing
  - Ensure charts resize properly on different viewports
  - Test touch interactions on mobile (swipe, tap targets)
  - Verify layout on various screen sizes
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 17. Add date and formatting utilities





  - Create `utils/dateUtils.ts` with date formatting and manipulation functions
  - Create `utils/formatters.ts` with currency and number formatting functions
  - Use Intl.NumberFormat for currency formatting
  - Use Intl.DateTimeFormat for date formatting
  - Handle edge cases and localization
  - _Requirements: Used across multiple UI components_

- [ ] 18. Set up Vitest configuration and run unit tests
  - Configure Vitest in `vite.config.ts`
  - Set up test environment with fake-indexeddb
  - Configure coverage reporting
  - Run all unit tests and verify they pass
  - Ensure 80%+ code coverage
  - _Requirements: 15.1, 15.2, 15.3, 16.1, 16.2, 16.3, 17.1, 17.2, 17.3_

- [ ]* 19. Create Playwright E2E test
  - Install and configure Playwright
  - Write E2E test: "User adds a transaction and sees it appear"
    - Navigate to application
    - Click "Add Transaction" button
    - Fill in transaction form (date, amount, category, notes)
    - Submit form
    - Verify transaction appears in transaction list
    - Navigate to dashboard
    - Verify balance is updated
  - Run E2E test and verify it passes
  - _Requirements: 1.1, 1.5, 6.3_

- [x] 20. Create README and documentation





  - Write README.md with project description
  - Add installation instructions
  - Add development commands (dev, build, test)
  - Document project structure
  - Add deployment instructions for Netlify
  - Include browser compatibility information
  - Add screenshots or demo link
  - _Requirements: All requirements benefit from documentation_

- [ ] 21. Configure build and deployment
  - Verify Vite production build configuration
  - Test production build locally
  - Create `netlify.toml` with build settings and SPA redirect rule
  - Set up Netlify deployment (connect repository)
  - Configure build command: `npm run build`
  - Configure publish directory: `dist`
  - Test deployment on Netlify
  - Verify application works in production environment
  - _Requirements: 10.4 (offline functionality after initial load)_

- [ ] 22. Final testing and polish
  - Test all features end-to-end manually
  - Verify offline functionality (disconnect network, test app)
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices (iOS, Android)
  - Verify accessibility with screen reader
  - Fix any bugs or issues found
  - Optimize performance (check bundle size, load times)
  - _Requirements: All requirements_
