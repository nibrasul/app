import { dbQuery } from '../../database/neon.js';

function calculateScore(profile) {
  const tapCount = isNaN(parseInt(profile.tapCount)) ? 0 : parseInt(profile.tapCount);
  const hasAvatar = profile.avatar && profile.avatar !== "/profile_avatar.png" && profile.avatar !== "";
  const hasBio = profile.bio && profile.bio.trim() !== "";
  const hasTags = profile.tags && profile.tags.some(t => t.text && t.text.trim() !== "");
  const hasQuote = profile.quote && profile.quote.text && profile.quote.text.trim() !== "";
  
  const connectedSocials = profile.socials ? profile.socials.filter(s => {
    if (!s.handle || s.handle.trim() === "") return false;
    if (s.handle === "Chat with me" || s.handle === "View & Download" || s.handle === "abhinand.design" || s.handle.includes("abhinand")) {
      return false;
    }
    return true;
  }).length : 0;

  const completionBoost = 
    (hasAvatar ? 2000 : 0) + 
    (hasBio ? 1500 : 0) + 
    (hasTags ? 1500 : 0) + 
    (hasQuote ? 1000 : 0) + 
    (connectedSocials >= 3 ? 1500 : 0);

  const premiumBoost = profile.isPremium ? 5000 : 0;

  return tapCount + completionBoost + premiumBoost;
}

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Support POST methods for incrementing score
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username parameter is required.' });
  }

  try {
    // 1. Fetch current profile
    const profileRes = await dbQuery('SELECT id, profile_data FROM profiles WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    if (profileRes.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const profile = profileRes[0];
    const profileData = typeof profile.profile_data === 'string'
      ? JSON.parse(profile.profile_data)
      : profile.profile_data;

    // 2. Increment tap count
    const currentTaps = isNaN(parseInt(profileData.tapCount)) ? 0 : parseInt(profileData.tapCount);
    profileData.tapCount = currentTaps + 1;

    // 3. Recalculate diamonds
    const totalScore = calculateScore(profileData);
    profileData.diamonds = totalScore.toString();

    // 4. Update profiles row
    await dbQuery(
      'UPDATE profiles SET profile_data = $1 WHERE id = $2',
      [JSON.stringify(profileData), profile.id]
    );

    // 5. Background log click/tap event for analytics
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : /tablet|ipad/i.test(userAgent) ? 'Tablet' : 'Desktop';

    dbQuery(
      'INSERT INTO click_events (profile_id, platform, visitor_ip, device_type) VALUES ($1, $2, $3, $4)',
      [profile.id, 'nfc_tap', visitorIp.split(',')[0].trim(), deviceType]
    ).catch(err => console.error('Failed to log tap click event:', err));

    return res.status(200).json({
      success: true,
      diamonds: totalScore
    });

  } catch (err) {
    console.error('Profile tap increments handler error:', err);
    return res.status(500).json({ error: 'Database error occurred during points increment.' });
  }
}
