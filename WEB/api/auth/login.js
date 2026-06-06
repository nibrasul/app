import { dbQuery } from '../../database/neon.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required.' });
  }

  try {
    // 1. Fetch user by email or username
    const userRes = await dbQuery(
      'SELECT id, name, username, email, password FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)',
      [email.trim()]
    );

    if (userRes.length === 0) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const user = userRes[0];

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    // 3. Issue JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_should_set_env';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login serverless handler error:', err);
    return res.status(500).json({ error: 'Database error occurred during login authentication.' });
  }
}
