import '@testing-library/jest-dom';

// jsdom has no layout engine, so it lacks these browser APIs that Mantine uses.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom has no fetch either. Tests must mock it (see helpers/fetch.ts); a real call fails loudly.
window.fetch = () => Promise.reject(new Error('fetch is not mocked in this test'));
