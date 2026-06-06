import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import serverless handlers
import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import updateProfileHandler from './api/profile/update.js';
import clickHandler from './api/profile/click.js';
import tapHandler from './api/profile/tap.js';
import getProfileHandler from './api/profile/get.js';
import deleteSocialHandler from './api/socials/delete.js';
import indexSocialHandler from './api/socials/index.js';
import analyticsHandler from './api/analytics/index.js';
import leaderboardHandler from './api/leaderboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Helper to adapterize Vercel's req/res for Express
function adapt(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("Handler error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

// Map endpoints matching vercel.json rewrites
app.post('/api/auth/register', adapt(registerHandler));
app.post('/api/auth/login', adapt(loginHandler));
app.put('/api/profile/update', adapt(updateProfileHandler));

// click mapping (with username)
app.post('/api/profile/:username/click', (req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, username: req.params.username },
    writable: true,
    configurable: true
  });
  next();
}, adapt(clickHandler));

// tap mapping (with username)
app.post('/api/profile/:username/tap', (req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, username: req.params.username },
    writable: true,
    configurable: true
  });
  next();
}, adapt(tapHandler));

// get profile mapping (with username)
app.get('/api/profile/:username', (req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, username: req.params.username },
    writable: true,
    configurable: true
  });
  next();
}, adapt(getProfileHandler));

// delete socials mapping
app.delete('/api/socials/:id', (req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, id: req.params.id },
    writable: true,
    configurable: true
  });
  next();
}, adapt(deleteSocialHandler));

// index socials mapping
app.get('/api/socials', adapt(indexSocialHandler));
app.post('/api/socials', adapt(indexSocialHandler));

// analytics mapping
app.get('/api/analytics', adapt(analyticsHandler));

// leaderboard mapping
app.get('/api/leaderboard', adapt(leaderboardHandler));

// Serve static assets from public/nfc
app.use('/nfc', express.static(path.join(__dirname, 'public/nfc')));

// Routing for nfc/username paths -> serve public/nfc/index.html
app.get('/nfc/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/nfc/index.html'));
});

// Routing for user profiles dashboard -> serve main index.html
app.get('/u/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve root static assets from public
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Local Vercel dev adapter running on port ${PORT}`);
});
