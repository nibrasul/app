import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { withAuth } from '../../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_UPLOAD_BYTES = 1024 * 1024; // Avatar uploads should be compact before reaching Vercel.
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

  const { filename, contentType, base64Data } = req.body;

  if (!base64Data) {
    return res.status(400).json({ error: 'base64Data is required.' });
  }

  const parsedDataUrl = parseDataUrl(base64Data);
  if (!parsedDataUrl) {
    return res.status(400).json({ error: 'Upload must be a base64 image data URL.' });
  }

  const cleanContentType = (contentType || parsedDataUrl.contentType || 'image/jpeg').toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(cleanContentType)) {
    return res.status(400).json({ error: 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.' });
  }

  try {
    const buffer = Buffer.from(parsedDataUrl.base64, 'base64');
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return res.status(413).json({ error: 'Image is too large after compression. Please choose a smaller image.' });
    }

    const fileExt = cleanContentType.split('/')[1] || 'jpg';
    const fallbackName = `${req.user.username || req.user.id}-avatar-${Date.now()}.${fileExt}`;
    const cleanFilename = sanitizeFilename(filename, fallbackName);
    const blobPath = `avatars/${req.user.id}/${Date.now()}-${cleanFilename}`;

    // If Vercel Blob Read/Write token is present, upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(blobPath, buffer, {
        contentType: cleanContentType,
        access: 'public',
      });
      return res.status(200).json({ url: blob.url });
    } else {
      // Fallback for local development offline mode: write to public/uploads
      const uploadsDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localFileName = sanitizeFilename(`${req.user.id}-${Date.now()}.${fileExt}`, `avatar-${Date.now()}.${fileExt}`);
      const localFilePath = path.join(uploadsDir, localFileName);

      fs.writeFileSync(localFilePath, buffer);

      // Return local URL statically served by Vite / Express
      return res.status(200).json({ url: `/uploads/${localFileName}` });
    }
  } catch (error) {
    console.error('File upload handler error:', error);
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
}

export default withAuth(handler);
