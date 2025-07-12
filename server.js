// server.js
const { createServer } = require('https');
const { parse }       = require('url');
const next            = require('next');
const fs              = require('fs');
const path            = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port     = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// DuckDNS 도메인용 인증서 경로
const httpsOptions = {
  key:  fs.readFileSync('/etc/letsencrypt/live/yousync.duckdns.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yousync.duckdns.org/fullchain.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  })
  .listen(port, hostname, err => {
    if (err) throw err;
    console.log(`> HTTPS Server running on https://yousync.duckdns.org:${port}`);
  });
});
