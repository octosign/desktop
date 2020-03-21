/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { join } = require('path');
const yaml = require('yaml');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Ajv = require('ajv');

const schema = require('./backend.schema.json');

/**
 * Tests and builds backends so they are ready to be bundled
 */

const skipFailed = process.argv.some(arg => arg === '--skip-failed');

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
    const metaFilePath = join(backendPath, 'backend.yml');
    const metaFile = fs.readFileSync(metaFilePath, { encoding: 'utf-8' });
    const metaInfo = yaml.parse(metaFile);

    const ajv = new Ajv();

    if (!ajv.validate(schema, metaInfo)) {
      console.error('Backend configuration did not pass schema check');
      console.error(ajv.errors);
      process.exit(1);
    }

    // Call build script
    try {
      const { err, stderr } = await exec(metaInfo.build, { cwd: backendPath });
      if (err) {
        console.error(err);
        console.error(stderr);
        if (skipFailed) {
          console.error(`Backend "${backend}" was skipped due to error and won't be included.`);
          continue;
        } else {
          process.exit(1);
        }
      }
    } catch (e) {
      if (skipFailed) {
        console.error(e);
        console.error(`Backend "${backend}" was skipped uue to error and won't be included.`);
        continue;
      } else {
        throw e;
      }
    }

    // Copy distributables
    const { stderr: cpErr } = await exec('cp -R ./dist/* ../dist/' + backend, {
      cwd: backendPath,
    });
    if (cpErr) {
      console.error('# ERROR: ');
      console.error(cpErr);
      process.exit(1);
    }

    console.log(`Finished building backend "${backend}"`);
  }

  console.log('Finished building all backends');
});
