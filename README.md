# Personal Finance Tracker

A privacy-focused, client-side web application for managing personal finances. Track transactions, set monthly budgets, and visualize spending patterns—all without sending your data to any server.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

## ✨ Features

- **Transaction Management**: Add, edit, and delete financial transactions with date, amount, category, and notes
- **Budget Tracking**: Set monthly spending limits by category and monitor remaining budget in real-time
- **Visual Dashboard**: 
  - Total balance card
  - Monthly spending summary
  - Category breakdown pie chart
  - Spending trends line chart
- **Data Portability**: Import and export data via CSV files for backup and migration
- **Privacy First**: All data stored locally in your browser using IndexedDB—no server, no tracking
- **Offline Capable**: Works completely offline after initial load
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite 7.x)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-finance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📋 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot module replacement |
| `npm run build` | Build production-ready application |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Generate test coverage report |
| `npx playwright test` | Run end-to-end tests |
| `npx playwright test --ui` | Run E2E tests with Playwright UI |

## 📁 Project Structure

```
personal-finance-tracker/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard page and visualization components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── MonthlySpendingCard.tsx
│   │   │   ├── CategoryPieChart.tsx
│   │   │   └── SpendingLineChart.tsx
│   │   ├── transactions/       # Transaction management components
│   │   │   ├── Transactions.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionItem.tsx
│   │   ├── budgets/           # Budget management components
│   │   │   ├── Budgets.tsx
│   │   │   ├── BudgetList.tsx
│   │   │   ├── BudgetForm.tsx
│   │   │   └── BudgetItem.tsx
│   │   ├── settings/          # Import/Export functionality
│   │   │   ├── Settings.tsx
│   │   │   ├── ImportCSV.tsx
│   │   │   └── ExportCSV.tsx
│   │   └── common/            # Shared UI components
│   │       ├── Navigation.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── ErrorBoundary.tsx
│   ├── services/              # Business logic layer
│   │   ├── transactionService.ts
│   │   ├── budgetService.ts
│   │   └── calculationService.ts
│   ├── storage/               # Data persistence layer
│   │   └── indexeddb.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   ├── csv.ts
│   │   ├── dateUtils.ts
│   │   ├── formatters.ts
│   │   └── errorHandling.ts
│   ├── contexts/              # React contexts
│   │   └── AccessibilityContext.tsx
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── e2e/                      # End-to-end tests
├── public/                   # Static assets
├── .kiro/                    # Kiro spec files
│   └── specs/
│       └── personal-finance-tracker/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── ACCESSIBILITY.md          # Accessibility implementation details
├── RESPONSIVE_DESIGN_IMPLEMENTATION.md  # Responsive design details
└── README.md                 # This file
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 7.2 (fast builds and hot module replacement)
- **Styling**: Tailwind CSS 4.1 (utility-first CSS framework)
- **Data Visualization**: Recharts 3.4 (React charting library)
- **Routing**: React Router DOM 7.9
- **Storage**: IndexedDB via idb 8.0 (Promise-based wrapper)
- **Testing**: 
  - Vitest 4.0 (unit tests)
  - Playwright 1.56 (E2E tests)
  - Testing Library (React component testing)
  - fake-indexeddb (IndexedDB mocking)

## 🌐 Browser Compatibility

The application requires a modern browser with IndexedDB support:

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**Note**: Internet Explorer is not supported.

## 📦 Deployment

### Netlify Deployment

1. **Build Configuration**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20.19 or higher

2. **Create `netlify.toml`** in the project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Deploy**:
   - Connect your repository to Netlify
   - Configure build settings as above
   - Deploy automatically on push to main branch

### Other Static Hosting Providers

The application can be deployed to any static hosting service:

- **Vercel**: Use the Vite preset
- **GitHub Pages**: Build and deploy the `dist` folder
- **Cloudflare Pages**: Connect repository with build command `npm run build`
- **AWS S3 + CloudFront**: Upload `dist` folder contents

**Important**: Ensure your hosting provider is configured to serve `index.html` for all routes (SPA redirect rule).

## 🔒 Privacy & Security

- **No Backend**: All data processing happens in your browser
- **Local Storage**: Data stored in IndexedDB, never sent to any server
- **No Tracking**: No analytics, cookies, or third-party scripts
- **No Authentication**: No accounts, passwords, or personal information required
- **Data Control**: Export your data anytime via CSV

## ♿ Accessibility

This application is built with accessibility in mind:

- Keyboard navigation support for all interactive elements
- ARIA labels and roles for screen readers
- Minimum 4.5:1 color contrast ratio (WCAG 2.1 AA)
- Focus indicators on all interactive elements
- Minimum 44x44px touch targets for mobile
- Skip navigation link for keyboard users
- ARIA live regions for dynamic content updates

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed implementation.

## 📱 Responsive Design

The application adapts to different screen sizes:

- **Mobile** (< 640px): Hamburger menu, stacked layout, simplified charts
- **Tablet** (640px - 1024px): Optimized layout with touch-friendly controls
- **Desktop** (> 1024px): Sidebar navigation, multi-column dashboard, enhanced charts

See [RESPONSIVE_DESIGN_IMPLEMENTATION.md](./RESPONSIVE_DESIGN_IMPLEMENTATION.md) for details.

## 🧪 Testing

### Unit Tests

Run unit tests for services, utilities, and storage layer:

```bash
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
npx playwright test              # Run all tests
npx playwright test --ui         # Interactive UI mode
npx playwright test --headed     # See browser
npx playwright show-report       # View test report
```

## 📊 Data Format

### CSV Import/Export Format

**Transactions CSV**:
```csv
date,amount,category,notes
2025-01-15,-45.50,Groceries,Weekly shopping
2025-01-16,2000.00,Income,Salary
```

**Budgets CSV**:
```csv
month,category,limit
2025-01,Groceries,400.00
2025-01,Entertainment,150.00
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Heroicons](https://heroicons.com/)

## 📧 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Made with ❤️ for privacy-conscious individuals who want to take control of their finances.**
