import { exec } from 'child_process';
import sanitize from 'sanitize-filename';

/**
 * Child process factory
 *
 * Assumes cwd, executable and operation are safe and file path potentially unsafe
 * Uses powershell on windows
 */
class Exec {
  public static run(cwd: string, executable: string, operation: string, file?: string) {
    const args = file ? `${operation} '${Exec.normalizeFilePath(file)}'` : operation;
    return exec(`${executable} ${args}`, {
      cwd,
      shell: process.platform === 'win32' ? 'powershell' : 'sh',
    });
  }

  /**
   * Make string safe, normalized file path
   *
   * Expects absolute file path
   * Uses forward slashes, removes any unsafe characters so it's safe to use in quotes
   */
  private static normalizeFilePath(path: string) {
    const toUnix = (path: string) => {
      path = path.replace(/\\/g, '/');
      const double = /\/\//;
      // Dobule slash is not replaced correctly on some platforms
      while (path.match(double)) path = path.replace(double, '/');
      return path;
    };

    const normalized = toUnix(path);
    // Detect windows prefix that'll add after processing
    const windowsPrefixMatch = normalized.match(/^(\w:)(.*)/);
    const prefix = windowsPrefixMatch ? windowsPrefixMatch[1] : undefined;

    const safe = (windowsPrefixMatch ? windowsPrefixMatch[2] : normalized)
      .split('/')
      .map(part => sanitize(part).replace(/'/g, ''))
      .join('/');

    return prefix ? `${prefix}${safe}` : safe;
  }
}

export default Exec;
