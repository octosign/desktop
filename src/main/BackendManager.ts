import { readdir, readFile } from 'node:fs/promises';
import { join } from 'path';
import yaml from 'yaml';

import Backend from './Backend';
import BackendConfig from '../shared/BackendConfig';
import BackendState from '../shared/BackendState';
import { BackendMetadata } from '../shared/BackendResults';

export default class BackendManager {
  private readonly backendsPath: string;

  /**
   * Loaded backends
   */
  private readonly backends: { [slug: string]: Backend } = {};

  /**
   * Last retrieved metadata for a backend
   */
  private readonly metadata: { [slug: string]: BackendMetadata } = {};

  public constructor(backendsPath: string) {
    this.backendsPath = backendsPath;
  }

  /**
   * Load all backends so they are ready to be retrieved
   */
  public async load() {
    const files = await readdir(this.backendsPath, { withFileTypes: true });
    const backends = files.filter(f => f.isDirectory() && f.name !== 'dist').map(f => f.name);

    await Promise.all(
      backends.map(async slug => (this.backends[slug] = await this.loadBackend(slug))),
    );

    await Promise.all(
      backends.map(async slug => (this.metadata[slug] = await this.fetchMetadata(slug))),
    );
  }

  /**
   * Get all loaded backends and their state, sorted by identifier
   */
  public list() {
    return Object.entries(this.backends)
      .map(([slug, backend]) => {
        const metadata = this.metadata[slug];
        return {
          slug: slug,
          config: backend.getConfig(),
          available: metadata.status === 'OK' ? true : metadata.status,
          supports: metadata.supports,
          options: metadata.options,
        } as BackendState;
      })
      .sort((a, b) => (a.slug > b.slug ? 1 : b.slug > a.slug ? -1 : 0));
  }

  /**
   * Get backend specified by the slug
   */
  public get(slug: string) {
    return this.backends[slug];
  }

  public listMetadata() {
    return this.metadata;
  }

  private async loadBackend(slug: string) {
    const backendPath = join(this.backendsPath, slug);

    const configFilePath = join(backendPath, 'backend.yml');
    const configFile = await readFile(configFilePath, { encoding: 'utf-8' });
    const configInfo = yaml.parse(configFile) as BackendConfig;

    // We have to remove possible .exe on non-Windows platforms
    if (process.platform !== 'win32') configInfo.exec = configInfo.exec.replace('.exe', '');

    // Allow using platform specific exec
    if (process.platform === 'win32' && typeof configInfo.execWindows === 'string') {
      configInfo.exec = configInfo.execWindows;
    } else if (process.platform === 'darwin' && typeof configInfo.execMac === 'string') {
      configInfo.exec = configInfo.execMac;
    } else if (process.platform === 'linux' && typeof configInfo.execLinux === 'string') {
      configInfo.exec = configInfo.execLinux;
    }
    delete configInfo.execWindows;
    delete configInfo.execMac;
    delete configInfo.execLinux;

    return new Backend(configInfo, backendPath);
  }

  private async fetchMetadata(slug: string) {
    const response = await this.backends[slug].meta();

    // We support translation on status
    return response
      ? {
          ...response,
          status: response.status !== 'OK' ? response.status : response.status,
        }
      : { status: 'Unreachable' };
  }
}
