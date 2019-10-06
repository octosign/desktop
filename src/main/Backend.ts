import { exec } from 'child_process';

class Backend {
  public sign(filePath: string) {
    exec(
      '"./jdk/bin/java.exe" -jar ./sign.jar sign ' + filePath,
      { cwd: '../dss/dist' },
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        }
        if (stderr) {
          console.error(stderr);
        }
        if (stdout) {
          console.log(stdout);
        }
      },
    );
  }
}

export default Backend;
