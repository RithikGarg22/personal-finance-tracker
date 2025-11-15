import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Navigation from './components/common/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import Transactions from './components/transactions/Transactions';
import Budgets from './components/budgets/Budgets';
import Settings from './components/settings/Settings';

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            {/* Main Content Area */}
            <main className="lg:ml-64 pt-16 lg:pt-0">
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Skip to main content link for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                           bg-blue-600 text-white px-4 py-2 rounded-md z-50"
                >
                  Skip to main content
                </a>
                
                <div id="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
        </BrowserRouter>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
