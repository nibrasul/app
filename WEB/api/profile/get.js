import { dbQuery } from '../../database/neon.js';

const defaultProfile = {
  name: "Abhinand",
  tagline: "Let's connect!",
  diamonds: "12000",
  avatar: "/profile_avatar.png",
  isOnline: true,
  tags: [
    { text: "UI/UX Designer", type: "role" },
    { text: "Digital Creator", type: "role" },
    { text: "Bangalore, India", type: "location" }
  ],
  bio: "I design meaningful experiences that connect brands with people.",
  socials: [
    { platform: "Instagram", handle: "@abhinand.designs", url: "https://instagram.com/abhinand.designs", icon: "Instagram", color: "#E1306C" },
    { platform: "LinkedIn", handle: "Abhinand Kumar", url: "https://linkedin.com", icon: "Linkedin", color: "#0077B5" },
    { platform: "Telegram", handle: "@abhinand_uiux", url: "https://t.me/abhinand_uiux", icon: "Send", color: "#0088cc" },
    { platform: "WhatsApp", handle: "Chat with me", url: "https://wa.me", icon: "MessageCircle", color: "#25D366" },
    { platform: "Download My CV / Resume", handle: "View & Download", url: "#", icon: "FileText", color: "#A259FF" },
    { platform: "Portfolio Link", handle: "abhinand.design", url: "https://abhinand.design", icon: "Link", color: "#6366F1" },
    { platform: "Behance", handle: "behance.net/abhinand", url: "https://behance.net/abhinand", icon: "Globe", color: "#0057ff" }
  ],
  quote: {
    text: "Design is not just what it looks like, it's how it connects.",
    signature: "Abhinand"
  }
};

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Username passed via URL query parameters by Vercel rewrite
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    // 1. Fetch profile by username
    const profileRes = await dbQuery(
      'SELECT id, profile_data FROM profiles WHERE LOWER(username) = LOWER($1)',
      [username.trim()]
    );

    if (profileRes.length === 0) {
      // Revert/fallback to default Abhinand profile if username doesn't exist
      return res.status(200).json(defaultProfile);
    }

    const profile = profileRes[0];
    const profileData = typeof profile.profile_data === 'string' 
      ? JSON.parse(profile.profile_data) 
      : profile.profile_data;

    // 2. Async capture traffic analytics in the background (Non-blocking response)
    const visitorIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : /tablet|ipad/i.test(userAgent) ? 'Tablet' : 'Desktop';

    dbQuery(
      'INSERT INTO profile_views (profile_id, visitor_ip, country_code, device_type) VALUES ($1, $2, $3, $4)',
      [profile.id, visitorIp.split(',')[0].trim(), country, deviceType]
    ).catch(err => console.error('Failed to log profile view analytics:', err));

    return res.status(200).json(profileData);

  } catch (err) {
    console.error('Profile fetch handler error:', err);
    return res.status(500).json({ error: 'Database error occurred while resolving profile.' });
  }
}
