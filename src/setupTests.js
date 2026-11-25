import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocks globales de ventana para JSDOM
if (typeof window !== 'undefined') {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);
  window.scrollTo = vi.fn();
}

