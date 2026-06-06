import { dbQuery } from '../../database/neon.js';
import { withAuth } from '../../middleware/auth.js';

function calculateScore(profile) {
  // Extract tap count
  const tapCount = isNaN(parseInt(profile.tapCount)) ? 0 : parseInt(profile.tapCount);
  
  // Checklist eligibility verification
  const hasAvatar = profile.avatar && profile.avatar !== "/profile_avatar.png" && profile.avatar !== "";
  const hasBio = profile.bio && profile.bio.trim() !== "";
  const hasTags = profile.tags && profile.tags.some(t => t.text && t.text.trim() !== "");
  const hasQuote = profile.quote && profile.quote.text && profile.quote.text.trim() !== "";
  
  // Count connected socials (exclude default values or empty handles)
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

async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { profileData } = req.body;

  if (!profileData) {
    return res.status(400).json({ error: 'Profile data is required for updates.' });
  }

  try {
    const userId = req.user.id;
    const username = req.user.username;

    // 1. Fetch current profile from database to get current tapCount
    const currentProfileRes = await dbQuery('SELECT profile_data FROM profiles WHERE user_id = $1', [userId]);
    
    if (currentProfileRes.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const currentProfile = typeof currentProfileRes[0].profile_data === 'string'
      ? JSON.parse(currentProfileRes[0].profile_data)
      : currentProfileRes[0].profile_data;

    // Retain server-managed values to prevent front-end spoofing
    profileData.tapCount = currentProfile.tapCount || 0;
    profileData.isPremium = currentProfile.isPremium || false;

    // Recalculate diamonds score
    const totalScore = calculateScore(profileData);
    profileData.diamonds = totalScore.toString();

    // 2. Perform Profile Update
    await dbQuery(
      'UPDATE profiles SET profile_data = $1 WHERE user_id = $2',
      [JSON.stringify(profileData), userId]
    );

    return res.status(200).json({
      success: true,
      diamonds: profileData.diamonds
    });

  } catch (err) {
    console.error('Profile update serverless handler error:', err);
    return res.status(500).json({ error: 'Database error occurred while updating profile.' });
  }
}

// Wrap with JWT Authentication filter
export default withAuth(handler);
