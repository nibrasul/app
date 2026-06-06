import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Higher-order function to wrap serverless routes requiring authorization
 */
export function withAuth(handler) {
  return async (req, res) => {
    try {
      // Always allow OPTIONS requests through
      if (req.method === 'OPTIONS') {
        return await handler(req, res);
      }

      // Log all headers for debugging (remove in production)
      console.log('[Auth] Request headers:', Object.keys(req.headers));

      // Get authorization header (case insensitive)
      const authHeader = req.headers.authorization || req.headers.Authorization;
      console.log('[Auth] Auth header present:', !!authHeader);

      if (!authHeader) {
        console.log('[Auth] No authorization header found');
        return res.status(401).json({
          error: 'Access token missing. Please log in.',
          details: 'Authorization header not provided'
        });
      }

      // Extract token from "Bearer <token>"
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        console.log('[Auth] Invalid authorization header format');
        return res.status(401).json({
          error: 'Invalid authorization format. Use: Bearer <token>',
          details: 'Header must be in format: Bearer your_jwt_token'
        });
      }

      const token = parts[1];
      console.log('[Auth] Token extracted, length:', token.length);

      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_should_set_env';
      if (jwtSecret === 'fallback_secret_should_set_env') {
        console.warn('[Auth] Warning: Using fallback JWT secret. Set JWT_SECRET in environment variables.');
      }

      try {
        const decoded = jwt.verify(token, jwtSecret);
        console.log('[Auth] Token verified for user:', decoded.username || decoded.id);
        req.user = decoded; // Contains parsed credentials: id, username, email, name
        return await handler(req, res);
      } catch (jwtError) {
        console.error('[Auth] JWT verification failed:', jwtError.message);

        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expired. Please log in again.',
            expiredAt: jwtError.expiredAt
          });
        }

        if (jwtError.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Invalid token format. Please log in again.',
            details: jwtError.message
          });
        }

        return res.status(401).json({
          error: 'Authentication failed. Please log in again.',
          details: jwtError.message
        });
      }
    } catch (err) {
      console.error('[Auth] Unexpected authentication error:', err);
      return res.status(500).json({
        error: 'Authentication service error. Please try again.',
        details: err.message
      });
    }
  };
}