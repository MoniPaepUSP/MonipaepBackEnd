import app from './app';
import logger from './common/loggerConfig';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { serverConfig } from './config';
import { ServerEnvironments } from './types/config.types';

const isDev = serverConfig.NODE_ENV === ServerEnvironments.DEVELOPMENT;

if (isDev) {
  http.createServer(app).listen(serverConfig.HTTP_SERVER_PORT, () => {
    logger.info('Server running on http://localhost:81');
  });
} else {
  http.createServer((req, res) => {
    logger.info('Access on port 81, redirecting to HTTPS');
    res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
    res.end();
  }).listen(serverConfig.HTTP_SERVER_PORT);

  const options = {
    key: fs.readFileSync('/etc/ssl/certs/privkey1.pem'),
    cert: fs.readFileSync('/etc/ssl/certs/fullchain1.pem'),
  };

  https.createServer(options, app).listen(serverConfig.HTTPS_SERVER_PORT, () => {
    logger.info('Server running using HTTPS');
  });;
}
  
