import { dbQuery } from '../database/neon.js';

function satisfiesLeaderboardCriteria(profile) {
  if (!profile.isPremium) return false;
  
  const hasAvatar = profile.avatar && profile.avatar !== "/profile_avatar.png" && profile.avatar !== "";
  const hasBio = profile.bio && profile.bio.trim() !== "";
  const hasTags = profile.tags && profile.tags.some(t => t.text && t.text.trim() !== "");
  
  const connectedSocials = profile.socials ? profile.socials.filter(s => {
    if (!s.handle || s.handle.trim() === "") return false;
    if (s.handle === "Chat with me" || s.handle === "View & Download" || s.handle === "abhinand.design" || s.handle.includes("abhinand")) {
      return false;
    }
    return true;
  }).length : 0;

  return hasAvatar && hasBio && hasTags && connectedSocials >= 3;
}

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

  try {
    const rows = await dbQuery('SELECT username, profile_data FROM profiles');
    
    const leaders = rows.map(row => {
      try {
        const profile = typeof row.profile_data === 'string'
          ? JSON.parse(row.profile_data)
          : row.profile_data;
          
        if (!satisfiesLeaderboardCriteria(profile)) {
          return null;
        }

        return {
          username: row.username,
          name: profile.name,
          avatar: profile.avatar,
          diamonds: isNaN(parseInt(profile.diamonds)) ? 0 : parseInt(profile.diamonds),
          tag: profile.tags ? (profile.tags.filter(t => t.type === 'role')[0]?.text || '') : ''
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // Sort by diamonds descending
    leaders.sort((a, b) => b.diamonds - a.diamonds);
    
    return res.status(200).json(leaders);

  } catch (err) {
    console.error('Leaderboard serverless handler error:', err);
    return res.status(500).json({ error: 'Database error occurred while fetching leaderboard.' });
  }
}
