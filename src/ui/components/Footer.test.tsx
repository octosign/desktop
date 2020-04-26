import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Footer from './Footer';
import Providers from './Providers';

describe('Footer', () => {
  it('Contains logo that opens octosign.com', () => {
    const { getByAltText } = render(
      <Providers>
        <Footer onSelectFiles={() => 0} onOpenSettings={() => 0} />
      </Providers>,
    );

    const logo = getByAltText('Logo');
    const anchor = logo.closest('a') as HTMLAnchorElement;

    expect(anchor.href).toMatch(/octosign\.com/);
    expect(anchor.target).toBe('blank');
  });

  it('Contains "Select files" button triggering selection and info about drag & drop', () => {
    const onSelectFilesMock = jest.fn();

    const { getByText } = render(
      <Providers>
        <Footer onSelectFiles={onSelectFilesMock} onOpenSettings={() => 0} />
      </Providers>,
    );

    fireEvent.click(getByText('Select files'));

    expect(onSelectFilesMock).toHaveBeenCalled();

    expect(() => getByText('drag and drop', { exact: false })).not.toThrow();
  });

  it('Contains link to Help that opens octosign.com/help', () => {
    const { getByText } = render(
      <Providers>
        <Footer onSelectFiles={() => 0} onOpenSettings={() => 0} />
      </Providers>,
    );

    const anchor = getByText('Help') as HTMLAnchorElement;

    expect(anchor.href).toMatch(/octosign\.com\/help/);
    expect(anchor.target).toBe('blank');
  });

  it('Contains link to Settings that opens Settings screen', () => {
    const onOpenSettingsMock = jest.fn();

    const { getByText } = render(
      <Providers>
        <Footer onSelectFiles={() => 0} onOpenSettings={onOpenSettingsMock} />
      </Providers>,
    );

    fireEvent.click(getByText('Settings'));

    expect(onOpenSettingsMock).toHaveBeenCalled();
  });
});
