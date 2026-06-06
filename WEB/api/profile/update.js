import { dbQuery } from '../../database/neon.js';
import { withAuth } from '../../middleware/auth.js';

const MAX_PROFILE_PAYLOAD_BYTES = 100 * 1024;

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

function findBase64ImagePath(value, path = 'profileData') {
  if (typeof value === 'string') {
    return value.startsWith('data:image/') ? path : null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const result = findBase64ImagePath(value[index], `${path}[${index}]`);
      if (result) return result;
    }
    return null;
  }

  if (value && typeof value === 'object') {
    for (const [key, childValue] of Object.entries(value)) {
      const result = findBase64ImagePath(childValue, `${path}.${key}`);
      if (result) return result;
    }
  }

  return null;
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

  const base64ImagePath = findBase64ImagePath(profileData);
  if (base64ImagePath) {
    return res.status(400).json({
      error: `Base64 images are not allowed in ${base64ImagePath}. Please upload the image first and save only the returned URL.`
    });
  }

  const incomingPayloadBytes = Buffer.byteLength(JSON.stringify({ profileData }), 'utf8');
  if (incomingPayloadBytes > MAX_PROFILE_PAYLOAD_BYTES) {
    return res.status(413).json({
      error: `Profile payload is ${(incomingPayloadBytes / 1024).toFixed(2)}KB. Keep profileData below 100KB by storing images as URLs.`
    });
  }

  try {
    const userId = req.user.id;

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

    const finalPayloadBytes = Buffer.byteLength(JSON.stringify({ profileData }), 'utf8');
    if (finalPayloadBytes > MAX_PROFILE_PAYLOAD_BYTES) {
      return res.status(413).json({
        error: `Profile payload is ${(finalPayloadBytes / 1024).toFixed(2)}KB after scoring. Keep profileData below 100KB.`
      });
    }

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

// Increase Vercel Serverless Function body parsing limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
