/**
 * Runs notarization on the macOS distributables
 */
import { notarize } from 'electron-notarize';

export default async function notarizing(context) {
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
