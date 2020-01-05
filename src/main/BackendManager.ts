import { readdir, readFile } from 'fs-extra';
import { join, sep } from 'path';
import yaml from 'yaml';

import Backend from './Backend';
import BackendConfig from '../shared/BackendConfig';

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
   * Get all loaded backends
   */
  public list() {
    return this.backends;
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

    // We have to adjust the path separators to the current platform
    configInfo.exec = configInfo.exec.replace(/\//g, sep);

    return new Backend(configInfo, backendPath);
  }
}
