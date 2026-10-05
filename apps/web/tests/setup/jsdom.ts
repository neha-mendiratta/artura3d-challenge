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

// jsdom has no WebGL, so form and page tests use an empty stand-in for the 3D preview.
// It records its props, so tests can check what the form passes to it.
// The 3D model itself is tested with @react-three/test-renderer (tests/components/OrthoticModel.test.tsx).
jest.mock('../../src/components/OrthoticPreview', () => ({ OrthoticPreview: jest.fn(() => null) }));
