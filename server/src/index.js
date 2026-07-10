const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  console.log(`Brand&co. API listening on port ${env.port} (${env.nodeEnv})`);
});

// Give in-flight requests a chance to finish before the process exits.
function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
