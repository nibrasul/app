import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { withAuth } from '../../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_UPLOAD_BYTES = 1024 * 1024; // 1MB for avatars
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;

  return {
    contentType: match[1].toLowerCase(),
    base64: match[2]
  };
}

function sanitizeFilename(filename, fallback) {
  return (filename || fallback)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 140);
}

async function handler(req, res) {
  console.log('[Upload] Request received:', {
    method: req.method,
    url: req.url,
    hasBody: !!req.body,
    contentType: req.headers['content-type']
  });

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    console.log('[Upload] Handling OPTIONS preflight');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Log authentication info (user should be attached by withAuth middleware)
  console.log('[Upload] User authenticated:', req.user ? {
    id: req.user.id,
    username: req.user.username,
    email: req.user.email
  } : 'No user object');

  if (!req.user) {
    console.error('[Upload] No user object found - middleware may have failed');
    return res.status(401).json({
      error: 'Authentication failed. User not found in request.',
      details: 'User object not attached by auth middleware'
    });
  }

  const { filename, contentType, base64Data } = req.body;

  console.log('[Upload] Request body keys:', Object.keys(req.body || {}));
  console.log('[Upload] base64Data present:', !!base64Data);
  console.log('[Upload] base64Data length:', base64Data ? base64Data.length : 0);

  if (!base64Data) {
    return res.status(400).json({
      error: 'base64Data is required.',
      details: 'No image data provided in request body'
    });
  }

  const parsedDataUrl = parseDataUrl(base64Data);
  if (!parsedDataUrl) {
    console.error('[Upload] Invalid data URL format');
    return res.status(400).json({
      error: 'Upload must be a base64 image data URL.',
      details: 'Expected format: data:image/[type];base64,[data]'
    });
  }

  const cleanContentType = (contentType || parsedDataUrl.contentType || 'image/jpeg').toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(cleanContentType)) {
    return res.status(400).json({
      error: 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.',
      details: `Received type: ${cleanContentType}`
    });
  }

  try {
    const buffer = Buffer.from(parsedDataUrl.base64, 'base64');
    console.log('[Upload] Image buffer size:', buffer.length, 'bytes');

    if (buffer.length > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        error: `Image is too large (${(buffer.length / 1024).toFixed(2)}KB). Maximum size is 1MB.`,
        details: 'Please compress your image before uploading'
      });
    }

    const fileExt = cleanContentType.split('/')[1] || 'jpg';
    const fallbackName = `${req.user.username || req.user.id}-avatar-${Date.now()}.${fileExt}`;
    const cleanFilename = sanitizeFilename(filename, fallbackName);
    const blobPath = `avatars/${req.user.id}/${Date.now()}-${cleanFilename}`;

    console.log('[Upload] Storage path:', blobPath);

    // If Vercel Blob Read/Write token is present, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('[Upload] Using Vercel Blob storage');
      const blob = await put(blobPath, buffer, {
        contentType: cleanContentType,
        access: 'public',
      });
      console.log('[Upload] Upload successful, URL:', blob.url);
      return res.status(200).json({
        success: true,
        url: blob.url,
        message: 'Avatar uploaded successfully'
      });
    } else {
      // Fallback for local development offline mode
      console.log('[Upload] Using local filesystem storage');
      const uploadsDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localFileName = sanitizeFilename(`${req.user.id}-${Date.now()}.${fileExt}`, `avatar-${Date.now()}.${fileExt}`);
      const localFilePath = path.join(uploadsDir, localFileName);

      fs.writeFileSync(localFilePath, buffer);
      console.log('[Upload] Local file saved:', localFilePath);

      // Return local URL statically served by Vite / Express
      return res.status(200).json({
        success: true,
        url: `/uploads/${localFileName}`,
        message: 'Avatar uploaded successfully (local storage)'
      });
    }
  } catch (error) {
    console.error('[Upload] File upload handler error:', error);
    return res.status(500).json({
      error: 'Failed to upload image.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default withAuth(handler);