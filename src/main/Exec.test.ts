import { exec } from 'child_process';
import { Mock } from 'vitest';

import Exec from './Exec';

describe('Exec', () => {
  it('Creates child process', () => {
    ((exec as unknown) as Mock).mockReturnValueOnce(123);

    const returned = Exec.run('/', 'echo', 'some');

    expect(returned).toBe(123);
    expect(exec).toHaveBeenCalledWith(`echo some`, expect.objectContaining({ cwd: '/' }));
  });

  it('Normalizes mixed file path', () => {
    Exec.run('/', 'echo', 'some', '//windows\\unix/mixed');

    expect(exec).toHaveBeenCalledWith(
      `echo some '/windows/unix/mixed'`,
      expect.objectContaining({ cwd: '/' }),
    );
  });

  it('Normalizes Windows file path', () => {
    Exec.run('/', 'echo', 'some', 'C:\\Users\\Jakub Ďuraš\\Documents\\path.pdf');

    expect(exec).toHaveBeenCalledWith(
      `echo some 'C:/Users/Jakub Ďuraš/Documents/path.pdf'`,
      expect.objectContaining({ cwd: '/' }),
    );
  });

  it('Uses powershell on windows and sh on other platforms', () => {
    const platform = process.platform;

    Object.defineProperty(process, 'platform', { value: 'win32' });
    Exec.run('/', 'echo', 'some', 'C:\\Users\\Jakub Ďuraš\\Documents\\path.pdf');

    expect(exec).toHaveBeenCalledWith(
      `echo some 'C:/Users/Jakub Ďuraš/Documents/path.pdf'`,
      expect.objectContaining({ cwd: '/', shell: 'powershell' }),
    );

    Object.defineProperty(process, 'platform', { value: 'darwin' });
    Exec.run('/', 'echo', 'some', 'C:\\Users\\Jakub Ďuraš\\Documents\\path.pdf');

    expect(exec).toHaveBeenCalledWith(
      `echo some 'C:/Users/Jakub Ďuraš/Documents/path.pdf'`,
      expect.objectContaining({ cwd: '/', shell: 'sh' }),
    );

    Object.defineProperty(process, 'platform', { value: platform });
  });

  it('Removes some potentially dangerous file path characters', () => {
    Exec.run('/', 'echo', 'some', "' && rhimrhaf");
    expect(exec).toHaveBeenLastCalledWith(`echo some ' && rhimrhaf'`, expect.anything());

    Exec.run('/', 'echo', 'some', '/innocent/path/\n/not.pdf');
    expect(exec).toHaveBeenLastCalledWith(`echo some '/innocent/path//not.pdf'`, expect.anything());

    Exec.run('/', 'echo', 'some', '/innocent/path/:/|/?/\0/not.pdf');
    expect(exec).toHaveBeenLastCalledWith(
      `echo some '/innocent/path/////not.pdf'`,
      expect.anything(),
    );
  });
});
