import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface AccessibilityContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message);
      // Clear after announcement
      setTimeout(() => setAssertiveMessage(''), 100);
    } else {
      setPoliteMessage(message);
      // Clear after announcement
      setTimeout(() => setPoliteMessage(''), 100);
    }
  }, []);

  return (
    <AccessibilityContext.Provider value={{ announce }}>
      {children}
      
      {/* ARIA live regions for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AccessibilityContext.Provider>
  );
}
