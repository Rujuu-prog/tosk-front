import "@testing-library/jest-dom/vitest";

import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// jsdom polyfills: matchMedia
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      // Legacy API
      addListener: () => {},
      removeListener: () => {},
    }),
  });
}

// Mock notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
  Notifications: ({ children }: { children?: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'notifications' }, children),
}));

// Wrapper for tests that need Mantine
const customRender = (ui: React.ReactElement, options = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(MantineProvider, null, children);
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render };
