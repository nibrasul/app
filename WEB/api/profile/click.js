import { dbQuery } from '../../database/neon.js';

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

  const { username } = req.query;
  const { platform } = req.body;

  if (!username || !platform) {
    return res.status(400).json({ error: 'Username and platform parameters are required.' });
  }

  try {
    // 1. Resolve profile ID
    const profileRes = await dbQuery('SELECT id FROM profiles WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    if (profileRes.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const profileId = profileRes[0].id;

    // 2. Log click event details
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : /tablet/i.test(userAgent) ? 'Tablet' : 'Desktop';

    await dbQuery(
      'INSERT INTO click_events (profile_id, platform, visitor_ip, device_type) VALUES ($1, $2, $3, $4)',
      [profileId, platform, visitorIp.split(',')[0].trim(), deviceType]
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Click event analytics handler error:', err);
    return res.status(500).json({ error: 'Database error occurred while logging click.' });
  }
}
