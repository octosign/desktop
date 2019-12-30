import isDev from 'electron-is-dev';
import fs from 'fs';
import mime from 'mime-types';
import { Readable } from 'stream';
import path from 'path';
import { Request, StreamProtocolResponse } from 'electron';

function interceptStreamProtocol() {
  // Content security policy
  const cspSrc = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' data:",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "media-src 'self' blob:",
    "object-src 'self' blob:",
  ];

  if (isDev) {
    cspSrc.push("connect-src 'self' ws://127.0.0.1:54439");
  } else {
    cspSrc.push("connect-src 'self'");
  }

  return function(request: Request, callback: (response: StreamProtocolResponse) => void) {
    const url = request.url.substr(8);
    // Fix file paths in the dist build with .asar
    const filePath = path
      .normalize(url)
      .replace('\\app.asar\\ui', '\\app.asar\\dist\\ui')
      .replace('/app.asar/ui', '/app.asar/dist/ui');
    const contentType = mime.contentType(path.extname(request.url));
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'private, max-age=0',
      'Content-Type': 'text/plain',
      'Content-Security-Policy': cspSrc.join(';'),
      Date: new Date().toUTCString(),
      Server: 'Electron',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    if (!fs.existsSync(filePath)) {
      const stream404 = new Readable();
      stream404.push('File not found');
      stream404.push(null);

      callback({
        statusCode: 404,
        headers: { ...headers, 'Content-Type': 'text/plain' },
        data: stream404,
      });
      return;
    }

    if (!contentType) {
      const stream415 = new Readable();
      stream415.push('Unknown file type');
      stream415.push(null);

      callback({
        statusCode: 415,
        headers: { ...headers, 'Content-Type': 'text/plain' },
        data: stream415,
      });
      return;
    }

    callback({
      statusCode: fs.existsSync(filePath) ? 200 : 404,
      headers: { ...headers, 'Content-Type': contentType },
      data: fs.createReadStream(filePath),
    });
  };
}

export default interceptStreamProtocol;
