import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Higher-order function to wrap serverless routes requiring authorization
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        return await handler(req, res);
      }

      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

      if (!token) {
        return res.status(401).json({ error: 'Access token missing. Please log in.' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_should_set_env');
      req.user = decoded; // Contains parsed credentials: id, username, email, name
      
      return await handler(req, res);
    } catch (err) {
      console.error('Authentication verification error:', err);
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
  };
}
