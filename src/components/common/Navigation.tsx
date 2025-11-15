import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transactions', icon: '💰' },
    { path: '/budgets', label: 'Budgets', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800">Finance Tracker</h1>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64
          ${isMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        {/* Desktop Header */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Finance Tracker</h1>
        </div>

        {/* Mobile Header in Sidebar */}
        <div className="lg:hidden p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Finance Tracker</h1>
          <button
            onClick={closeMenu}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <ul className="p-4 space-y-2" role="list">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
