/**
 * Runs notarization on the macOS distributables
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (process.env.NOTARIZE != 1) {
    console.info(
      `Skipping notarization for platform ${electronPlatformName} and NOTARIZE=${process.env.NOTARIZE}`,
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.octosign',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
};
