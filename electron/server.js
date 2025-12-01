const express = require('express');
const cors = require('cors');

/**
 * Start a small express server on provided port.
 * If port is taken (EADDRINUSE), try again with port 0 (ephemeral).
 */
function startServer(preferredPort = 3000) {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Example endpoints
    app.get('/ping', (req, res) => res.json({ message: 'pong from api' }));
    app.get('/health', (req, res) => res.json({
      uptime: process.uptime(),
      platform: process.platform,
      ts: Date.now()
    }));

    const server = app.listen(preferredPort, () => {
      const port = server.address().port;
      console.log(`[electron:api] Server listening on port ${port}`);
      resolve({ server, port });
    });

    server.on('error', async (err) => {
      console.warn(`[electron:api] Failed to start on port ${preferredPort} - ${err.message}`);
      if (err.code === 'EADDRINUSE') {
        // Try ephemeral port (0)
        server.close(() => {
          try {
            const s2 = app.listen(0, () => {
              const port = s2.address().port;
              console.log(`[electron:api] Server listening on fallback port ${port}`);
              resolve({ server: s2, port });
            });
          } catch (err2) {
            reject(err2);
          }
        });
      } else {
        reject(err);
      }
    });
  });
}

module.exports = { startServer };

// Allow the server to be started standalone for testing: `node electron/server.js`
if (require.main === module) {
  startServer(3000).then(({ port }) => console.log(`Started server on ${port}`)).catch(err => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}
