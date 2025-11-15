# Accessibility Features

This document outlines the accessibility features implemented in the Personal Finance Tracker application to ensure WCAG 2.1 Level AA compliance.

## Overview

The application has been designed with accessibility as a core principle, ensuring that all users, regardless of their abilities, can effectively use the application.

## Implemented Features

### 1. Skip Navigation Link

- **Location**: Layout component
- **Implementation**: A "Skip to main content" link appears at the top of the page
- **Behavior**: Hidden by default, becomes visible when focused via keyboard navigation
- **Purpose**: Allows keyboard users to bypass repetitive navigation and jump directly to main content

### 2. Keyboard Navigation

- **All Interactive Elements**: Fully accessible via keyboard (Tab, Shift+Tab, Enter, Escape)
- **Navigation Menu**: 
  - Can be opened/closed with keyboard
  - Escape key closes mobile menu
  - All navigation links are keyboard accessible
- **Forms**: All form fields can be navigated and filled using keyboard only
- **Dialogs**: 
  - Focus is trapped within modal dialogs
  - Escape key closes dialogs
  - Enter key confirms actions
  - Focus returns to trigger element when closed

### 3. Focus Indicators

- **Visual Focus Rings**: All interactive elements have visible focus indicators
- **Implementation**: 2px blue outline with 2px offset
- **CSS**: Uses `:focus-visible` to show focus only for keyboard navigation
- **Consistency**: Applied to buttons, links, form inputs, and all interactive elements
- **Minimum Size**: All touch targets are at least 44x44 pixels

### 4. ARIA Live Regions

- **Implementation**: AccessibilityContext provides announcement system
- **Two Priority Levels**:
  - `polite`: For non-critical updates (default)
  - `assertive`: For important errors and warnings
- **Usage**: Announces dynamic updates such as:
  - Transaction added/updated/deleted
  - Budget added/updated/deleted
  - CSV import/export success/failure
  - Form validation errors

### 5. Form Accessibility

#### Labels and Associations
- All form fields have explicit `<label>` elements with `htmlFor` attributes
- Required fields are marked with asterisk and `aria-label="required"`
- Helper text is associated using `aria-describedby`

#### Error Handling
- Validation errors are displayed inline below each field
- Error messages have `role="alert"` for screen reader announcement
- Fields with errors have `aria-invalid="true"`
- Error messages are associated with fields using `aria-describedby`

#### Form Structure
- Proper semantic HTML (`<form>`, `<fieldset>`, `<legend>`)
- Radio button groups use `<fieldset>` with `<legend>`
- All inputs have appropriate `type` attributes

### 6. Semantic HTML

- **Headings**: Proper heading hierarchy (h1, h2, h3)
- **Landmarks**: 
  - `<nav>` with `aria-label="Main navigation"`
  - `<main>` for main content area
  - `role="list"` for transaction and budget lists
- **Lists**: Proper use of `<ul>`, `<ol>`, and `<li>` elements
- **Buttons vs Links**: Buttons for actions, links for navigation

### 7. Screen Reader Support

#### ARIA Labels
- All icon-only buttons have `aria-label` attributes
- Decorative icons have `aria-hidden="true"`
- Complex components have descriptive labels

#### ARIA Attributes
- `aria-expanded` on menu toggle buttons
- `aria-modal="true"` on dialog components
- `aria-labelledby` and `aria-describedby` for dialog content
- `role="status"` for loading indicators
- `role="alert"` for error messages

#### Screen Reader Only Content
- `.sr-only` class for content visible only to screen readers
- Loading states announce "Loading..." to screen readers
- Keyboard shortcuts are announced in dialogs

### 8. Color Contrast

- **Text Color**: Uses gray-800 (#1f2937) on white background
- **Contrast Ratio**: Minimum 4.5:1 for normal text
- **Error States**: Red text on light red background with sufficient contrast
- **Success States**: Green text on light green background with sufficient contrast
- **Focus Indicators**: Blue (#3b82f6) with high contrast
- **No Color-Only Information**: All information conveyed by color also has text or icons

### 9. Responsive Design

- **Touch Targets**: Minimum 44x44 pixels on all interactive elements
- **Mobile Navigation**: Hamburger menu with proper ARIA attributes
- **Viewport Scaling**: No restrictions on user zoom
- **Flexible Layouts**: Content reflows properly at all viewport sizes

### 10. Dialog/Modal Accessibility

#### ConfirmDialog Component
- Focus management: Focus moves to dialog when opened
- Focus trap: Tab cycles through dialog elements only
- Keyboard support: Escape to cancel, Enter to confirm
- ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Visual keyboard hints displayed in dialog footer

## Testing Recommendations

### Manual Testing
1. **Keyboard Navigation**: Navigate entire app using only keyboard
2. **Screen Reader**: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
3. **Zoom**: Test at 200% zoom level
4. **Color Contrast**: Use browser DevTools or online contrast checkers

### Automated Testing
- Use axe DevTools browser extension
- Run Lighthouse accessibility audit
- Use WAVE browser extension

## Browser Compatibility

Accessibility features are supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- Add more comprehensive keyboard shortcuts
- Implement high contrast mode support
- Add preference for reduced motion
- Provide text size adjustment controls
- Add language selection for internationalization

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)
