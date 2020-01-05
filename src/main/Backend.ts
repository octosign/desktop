import { exec } from 'child_process';
import BackendConfig from '../shared/BackendConfig';

class Backend {
  private readonly config: BackendConfig;
  private readonly path: string;

  constructor(config: BackendConfig, path: string) {
    this.config = { version: 'dev', ...config };
    this.path = path;
  }

  public getConfig() {
    return this.config;
  }

  public sign(filePath: string) {
    return new Promise((resolve, reject) => {
      exec(`${this.config.exec} sign "${filePath}"`, { cwd: this.path }, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          console.error(err);
          return;
        }
        if (stderr) {
          console.error(stderr);
        }
        if (stdout) {
          console.log(stdout);
        }
        resolve();
      });
    });
  }
}

export default Backend;
