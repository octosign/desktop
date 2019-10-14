/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { join } = require('path');
const yaml = require('yaml');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Tests and builds backends so they are ready to be bundled
 */

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});

// Load list of the backends
fs.readdir('./backends', async function(err, items) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const backends = items.filter(
    path => path !== 'dist' && fs.lstatSync(join('./backends', path)).isDirectory(),
  );

  if (!fs.existsSync(join('./backends', 'dist'))) {
    fs.mkdirSync(join('./backends', 'dist'));
  }

  for (const backend of backends) {
    console.log(`# Building backend "${backend}"`);

    if (!fs.existsSync(join('./backends', 'dist', backend))) {
      fs.mkdirSync(join('./backends', 'dist', backend));
    }

    const backendPath = join('./backends', backend);
    const metaFilePath = join(backendPath, 'backend.yaml');
    const metaFile = fs.readFileSync(metaFilePath, { encoding: 'utf-8' });
    const metaInfo = yaml.parse(metaFile);

    // TODO: Add schema validation

    // Call build script
    const { err, stderr } = await exec(metaInfo.build, { cwd: backendPath });
    if (err) {
      console.error(err);
      console.error(stderr);
      process.exit(1);
    }

    // Copy distributables
    const { err: cpErr, stderr: cpStdErr } = await exec('cp -R ./dist/* ../dist/' + backend, {
      cwd: backendPath,
    });
    if (cpErr) {
      console.error(cpErr);
      console.error(cpStdErr);
      process.exit(1);
    }

    console.log(`Finished building backend "${backend}"`);
  }
});
