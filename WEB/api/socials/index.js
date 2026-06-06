import { dbQuery } from '../../database/neon.js';
import { withAuth } from '../../middleware/auth.js';

async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const userId = req.user.id;

  try {
    // 1. Fetch the user profile data
    const profileRes = await dbQuery('SELECT id, profile_data FROM profiles WHERE user_id = $1', [userId]);
    if (profileRes.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const profile = profileRes[0];
    const profileData = typeof profile.profile_data === 'string'
      ? JSON.parse(profile.profile_data)
      : profile.profile_data;

    // Handle GET: Fetch socials list
    if (req.method === 'GET') {
      return res.status(200).json(profileData.socials || []);
    }

    // Handle POST: Add new social link
    if (req.method === 'POST') {
      const { platform, handle, url, color, icon } = req.body;

      if (!platform || !url) {
        return res.status(400).json({ error: 'Platform and URL are required.' });
      }

      if (!profileData.socials) {
        profileData.socials = [];
      }

      // Add new social link item
      const newSocial = {
        platform,
        handle: handle || '',
        url,
        color: color || '#0052ff',
        icon: icon || platform
      };

      profileData.socials.push(newSocial);

      // Save back to PostgreSQL
      await dbQuery(
        'UPDATE profiles SET profile_data = $1 WHERE id = $2',
        [JSON.stringify(profileData), profile.id]
      );

      return res.status(201).json({ success: true, social: newSocial });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (err) {
    console.error('Socials serverless index handler error:', err);
    return res.status(500).json({ error: 'Database error occurred during socials operation.' });
  }
}

export default withAuth(handler);
