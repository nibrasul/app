import { dbQuery } from '../../database/neon.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const users = await dbQuery(
      'SELECT id, username, email, name, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'fallback_secret_should_set_env',
      { expiresIn: '7d' } // 7 days expiry
    );

    // Return user data (excluding password_hash) and token
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    };

    console.log('[Login] User logged in successfully:', userData.username);

    return res.status(200).json({
      success: true,
      user: userData,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('[Login] Error:', error);
    return res.status(500).json({
      error: 'Login failed. Please try again.',
      details: error.message
    });
  }
}