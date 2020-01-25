import { readdir, readFile } from 'fs-extra';
import { join, sep } from 'path';
import yaml from 'yaml';

import Backend from './Backend';
import BackendConfig from '../shared/BackendConfig';
import BackendState from '../shared/BackendState';

export default class BackendManager {
  private readonly backendsPath: string;

  /**
   * Loaded backends
   */
  private readonly backends: { [slug: string]: Backend } = {};

  public constructor(backendsPath: string) {
    this.backendsPath = backendsPath;
  }

  /**
   * Load all backends so they are ready to be retrieved
   */
  public async load() {
    const backends = await readdir(this.backendsPath);

    await Promise.all(
      backends.map(async slug => (this.backends[slug] = await this.loadBackend(slug))),
    );
  }

  /**
   * Get all loaded backends and their state, sorted by identifier
   */
  public list() {
    return Object.entries(this.backends)
      .map(
        entry =>
          ({
            slug: entry[0],
            config: entry[1].getConfig(),
            available: true,
          } as BackendState),
      )
      .sort((a, b) => (a.slug > b.slug ? 1 : b.slug > a.slug ? -1 : 0));
  }

  /**
   * Get backend specified by the slug
   */
  public get(slug: string) {
    return this.backends[slug];
  }

  private async loadBackend(slug: string) {
    const backendPath = join(this.backendsPath, slug);

    const configFilePath = join(backendPath, 'backend.yml');
    const configFile = await readFile(configFilePath, { encoding: 'utf-8' });
    const configInfo = yaml.parse(configFile) as BackendConfig;

    // We have to remove possible .exe on non-Windows platforms
    if (process.platform !== 'win32') configInfo.exec = configInfo.exec.replace('.exe', '');

    return new Backend(configInfo, backendPath);
  }
}
