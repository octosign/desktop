/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';

import SettingsDialog from './SettingsDialog';
import mockWindowAPI from '../mockWindowAPI';
import Providers from './Providers';

describe('SettingsDialog', () => {
  beforeAll(() => {
    mockWindowAPI(window);
    window.getVersion = jest.fn(() => '0.9001.0');
    window.OctoSign.setOptionValues = jest.fn();
  });

  afterAll(() => {
    // @ts-ignore
    window.OctoSign = undefined;
  });

  it('Displays title, General settings', () => {
    const { getByText } = render(
      <Providers>
        <SettingsDialog open={true} backends={[]} onClose={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Settings')).not.toThrow();
    expect(() => getByText('General')).not.toThrow();
    expect(() => getByText('Language', { selector: 'label' })).not.toThrow();
  });

  it('Gets and displays version', async () => {
    const { getByText } = render(
      <Providers>
        <SettingsDialog open={true} backends={[]} onClose={() => 0} />
      </Providers>,
    );

    await wait(() => expect(window.getVersion).toHaveBeenCalled());

    expect(() => getByText('Octosign v0.9001.0')).not.toThrow();
  });

  it('Calls onClose on clicking on Close', () => {
    const onClose = jest.fn();

    const { getByText } = render(
      <Providers>
        <SettingsDialog open={true} backends={[]} onClose={onClose} />
      </Providers>,
    );

    fireEvent.click(getByText('Close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('Displays backends', async () => {
    const backends = await window.OctoSign.list();

    const { getByText, baseElement } = render(
      <Providers>
        <SettingsDialog open={true} backends={backends} onClose={() => 0} />
      </Providers>,
    );

    expect(() => getByText('Advanced electronic signature')).not.toThrow();
    expect(() => getByText('v0.1.0 by Jakub Ďuraš (jakub@duras.me)')).not.toThrow();
    expect(() =>
      getByText('Advanced electronic signature usable on PDF', { exact: false }),
    ).not.toThrow();
    expect(() =>
      getByText('Licensed under GNU Lesser General Public License v2.1', { exact: false }),
    ).not.toThrow();
    expect(() => getByText('Source code available at', { exact: false })).not.toThrow();
    expect(
      baseElement.querySelector('a[href="https://github.com/durasj/octosign-dss"]'),
    ).not.toBeNull();

    expect(() => getByText('Simple image signature')).not.toThrow();
    expect(() => getByText('v0.2.0 (duras.me)')).not.toThrow();
    expect(() => getByText('Signs PDFs using chosen image', { exact: false })).not.toThrow();
  });

  it('Displays options and their values', async () => {
    const backends = await window.OctoSign.list();

    const { getByLabelText } = render(
      <Providers>
        <SettingsDialog open={true} backends={backends} onClose={() => 0} />
      </Providers>,
    );

    const dllPath = getByLabelText('PKCS #11 Library Path') as HTMLInputElement;

    expect(dllPath.value).toBe('dll/path.dll');
  });

  it('Persists option values', async () => {
    const backends = await window.OctoSign.list();

    const { getByLabelText } = render(
      <Providers>
        <SettingsDialog open={true} backends={backends} onClose={() => 0} />
      </Providers>,
    );

    const dllPath = getByLabelText('PKCS #11 Library Path') as HTMLInputElement;

    expect(dllPath.value).toBe('dll/path.dll');

    fireEvent.change(dllPath, { target: { value: 'different/path.dll' } });

    expect(dllPath.value).toBe('different/path.dll');

    await wait(() =>
      expect(window.OctoSign.setOptionValues).toHaveBeenCalledWith({
        dss: { dllPath: 'different/path.dll' },
      }),
    );
  });

  it.todo('Changes language using the Language select');
});
