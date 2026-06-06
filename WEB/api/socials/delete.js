import { dbQuery } from '../../database/neon.js';
import { withAuth } from '../../middleware/auth.js';

async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query; // Index of the link tile to delete
  const userId = req.user.id;

  if (id === undefined) {
    return res.status(400).json({ error: 'Social link identifier (id) is required.' });
  }

  try {
    // 1. Fetch profile
    const profileRes = await dbQuery('SELECT id, profile_data FROM profiles WHERE user_id = $1', [userId]);
    if (profileRes.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const profile = profileRes[0];
    const profileData = typeof profile.profile_data === 'string'
      ? JSON.parse(profile.profile_data)
      : profile.profile_data;

    if (!profileData.socials || profileData.socials.length === 0) {
      return res.status(400).json({ error: 'No social links exist on this profile.' });
    }

    // 2. Filter out link by index ID or platform name
    const linkIndex = parseInt(id);
    if (!isNaN(linkIndex) && linkIndex >= 0 && linkIndex < profileData.socials.length) {
      profileData.socials.splice(linkIndex, 1);
    } else {
      // Fallback matching by platform name key
      profileData.socials = profileData.socials.filter(
        (s) => s.platform.toLowerCase() !== id.toLowerCase()
      );
    }

    // 3. Save profile updates
    await dbQuery(
      'UPDATE profiles SET profile_data = $1 WHERE id = $2',
      [JSON.stringify(profileData), profile.id]
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Socials delete serverless handler error:', err);
    return res.status(500).json({ error: 'Database error occurred during link removal.' });
  }
}

export default withAuth(handler);
