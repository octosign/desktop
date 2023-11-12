import { vi } from "vitest";

export const pdfPageRenderMock = vi.fn(() => ({ promise: Promise.resolve() }));
export const pdfGetPageMock = vi.fn(() => ({
  getViewport: () => ({ width: 200, height: 400 }),
  render: pdfPageRenderMock,
}));
export const pdfDocumentMock = vi.fn(() => ({
  numPages: 9,
  // @ts-expect-error Page numbers are fake - not important here
  getPage: (pageNumber: number) => Promise.resolve(pdfGetPageMock(pageNumber)),
}));
export const getDocumentMock = vi.fn(() => ({ promise: Promise.resolve(pdfDocumentMock()) }));

// Real implementation
export const getDocument = getDocumentMock;
