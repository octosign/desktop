import { exec } from 'child_process';

class Backend {
  public sign(filePath: string) {
    return new Promise((resolve, reject) => {
      exec(
        '"./jdk/bin/java.exe" -jar ./sign.jar sign ' + filePath,
        { cwd: '../dss/dist' },
        (err, stdout, stderr) => {
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
        },
      );
    });
  }
}

export default Backend;
