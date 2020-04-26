import Store from 'electron-store';

import { BackendOption } from '../shared/BackendResults';

export type OptionValues = { [slug: string]: { [id: string]: string } };

class Settings {
  private readonly options: { [backendSlug: string]: BackendOption[] };
  private readonly store: Store;

  public constructor(options: { [backendSlug: string]: BackendOption[] }, fileName?: string) {
    this.options = options;

    this.store = new Store({
      defaults: this.getDefaults(),
      name: fileName || 'settings',
    });
  }

  public getOptions() {
    return this.options;
  }

  public getDefaults() {
    return Object.keys(this.options).reduce((acc, backendSlug) => {
      acc[backendSlug] = this.options[backendSlug].reduce((acc, option) => {
        if (option.defaultValue) acc[option.id] = option.defaultValue;
        return acc;
      }, {} as { [id: string]: string });
      return acc;
    }, {} as OptionValues);
  }

  public get(key?: string) {
    if (key) {
      return this.store.get(key);
    }

    return this.store.store;
  }

  public set(data: OptionValues) {
    return this.store.set(data);
  }

  public reset() {
    return this.store.reset(...Object.keys(this.options));
  }
}

export default Settings;
