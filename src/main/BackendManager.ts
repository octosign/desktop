import { readdir } from 'fs-extra';

import Backend from './Backend';

export default class BackendManager {
  private readonly backendsPath: string;

  public constructor(backendsPath: string) {
    this.backendsPath = backendsPath;
  }

  public async list() {
    const backends = await readdir(this.backendsPath);
    return Promise.all(
      backends.map(async () => {
        return new Backend();
      }),
    );
  }
}
