import { cleanup } from '@testing-library/react';
import { vi } from 'vitest'
import 'vitest-canvas-mock'

vi.mock('electron');
vi.mock('electron-is-dev');
vi.mock('child_process');
vi.mock('pdfjs-dist');

afterEach(() => {
  cleanup()
});
