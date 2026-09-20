import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';
import apirouter from './routes/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// API routes
app.use('/api', apirouter);
// Health check
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Verify Sentry - sends error to Sentry when hit
app.get('/senderror', function mainHandler(req, res) {
    Sentry.logger.info('User triggered test error', {
        action: 'test_error_endpoint',
    });
    Sentry.metrics.count('test_counter', 1);
    throw new Error("My first Sentry error!");
});
// Static files from frontend build
const distPath = path.join(__dirname, '..', 'vianet', 'dist');
app.use(express.static(distPath, {
    maxAge: 0,
    etag: true,
    lastModified: true,
}));
// SPA fallback - serve index.html for all non-file routes (client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});
// Sentry error handler - must be after all controllers
Sentry.setupExpressErrorHandler(app);
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + '\n');
});
export default app;
