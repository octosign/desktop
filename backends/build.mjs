import fs from 'fs';
import { join } from 'path';
import yaml from 'yaml';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import Ajv from 'ajv';

import schema from './backend.schema.json' assert { type: 'json' };

/**
 * Tests and builds backends so they are ready to be bundled
 *
 * Flags:
 * --skip-failed    - Do not exit on backends that cannot be built.
 * --inherit-stdio  - Show output from building by reusing the same standard output and error.
 */

const skipFailed = process.argv.some(arg => arg === '--skip-failed');
const inheritStdio = process.argv.some(arg => arg === '--inherit-stdio');

process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});

// Load list of the backends
fs.readdir('./backends', async function (err, items) {
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
      const [cmd, ...args] = metaInfo.build.split(' ');

      const child = spawn(cmd, args, {
        cwd: backendPath,
        stdio: inheritStdio ? 'inherit' : undefined,
      });

      await new Promise((resolve, reject) => {
        child.on('close', code =>
          code === 0 ? resolve() : reject(`Failed with exit code ${code}`),
        );
      });
    } catch (e) {
      if (skipFailed) {
        console.error(e);
        console.error(`❌ Backend "${backend}" was skipped due to an error and won't be included.`);
        continue;
      } else {
        throw e;
      }
    }

    // Copy distributables
    const { stderr: cpErr } = await promisify(exec)('cp -R ./dist/* ../dist/' + backend, {
      cwd: backendPath,
    });
    if (cpErr) {
      console.error('❌ ERROR: ');
      console.error(cpErr);
      process.exit(1);
    }

    console.log(`✅ Finished building backend "${backend}"`);
  }

  console.log('✅✅✅ Finished building all backends');
});
