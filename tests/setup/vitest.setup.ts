import "@testing-library/jest-dom/vitest";

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
