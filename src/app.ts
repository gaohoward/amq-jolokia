import createServer from './utils/server.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let staticBase = "";
if (process.argv[2] === undefined) {
  console.log('no static dir specified');
} else {
  staticBase = path.resolve(process.argv[2]);
}

createServer(staticBase)
  .then((server) => {
    server.listen(9001, () => {
      console.info(`Listening on http://0.0.0.0:9001`);
    });

    let options = {};

    if (process.env.NODE_ENV === 'production') {
      console.log(
        'setting up tls in production mode',
        'cert',
        process.env.SERVER_CERT,
      );

      if (
        process.env.SERVER_KEY != undefined &&
        process.env.SERVER_CERT != undefined
      ) {
        options = {
          key: fs.readFileSync(process.env.SERVER_KEY),
          cert: fs.readFileSync(process.env.SERVER_CERT),
        };
      } else {
        throw new Error('Missing cert/key files');
      }
    } else {
      console.log('setting up tls using dev certs');
      options = {
        key: fs.readFileSync(path.join(__dirname, 'config/domain.key')),
        cert: fs.readFileSync(path.join(__dirname, 'config/domain.crt')),
      };
    }
    const secureServer = https.createServer(options, server);
    secureServer.listen(9443, () => {
      console.info('Listening on https://0.0.0.0:9443');
    });
  })
  .catch((err) => {
    console.error(`Error: ${err}`);
  });
