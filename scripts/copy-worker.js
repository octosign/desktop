/**
 * Copies pdf.js worker manually because of lack of support for this from parcel
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

if (!fs.existsSync('./dist/ui')) {
  fs.mkdirSync('./dist/ui', { recursive: true });
}

fs.copyFileSync('./node_modules/pdfjs-dist/build/pdf.worker.js', './dist/ui/pdf.worker.js');
