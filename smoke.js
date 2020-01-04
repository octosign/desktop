/* eslint-disable @typescript-eslint/no-var-requires */
// A simple test to verify a visible window is opened with a title and some text
const path = require('path');
const Application = require('spectron').Application;

(async () => {
  let execPath;
  switch (process.platform) {
    case 'win32':
      execPath = path.join(__dirname, '.\\artifacts\\win-unpacked\\Octosign.exe');
      break;

    case 'darwin':
      execPath = path.join(__dirname, './artifacts/mac/Octosign.app/Contents/MacOS/Octosign');
      break;

    case 'linux':
      execPath = path.join(__dirname, './artifacts/linux-unpacked/com.octosign');
      break;

    default:
      throw new Error('Unknown platform.');
  }

  const app = new Application({
    path: execPath,
    requireName: 'spectronRequire',
    env: {
      ELECTRON_IS_DEV: '0',
      SPECTRON: '1',
    },
  });

  // Assume tests failed if it takes longer than 15 seconds
  const timeout = setTimeout(() => {
    console.error('Smoke test failed on timeout ✕');
    try {
      app.quit();
    } catch (e) {}
    process.exit(1);
  }, 15 * 1000);

  await app.start();

  const isVisible = await app.browserWindow.isVisible();

  // Verify the window is visible
  if (!isVisible) {
    throw new Error('Window is not visible');
  }

  const title = await app.client.getTitle();

  if (title !== 'Octosign') {
    throw new Error('App does not have correct title');
  }

  await app.stop();

  clearTimeout(timeout);
  console.log('Smoke test passed ✓');
})();
