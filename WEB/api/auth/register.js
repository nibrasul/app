import { dbQuery, dbTransaction } from '../../database/neon.js';
import bcrypt from 'bcryptjs';

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

  const { name, email, password, username } = req.body;

  // 1. Input Validation
  if (!name || !email || !password || !username) {
    return res.status(400).json({ error: 'All fields (name, email, username, password) are required.' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 alphanumeric characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // 2. Check availability of Email and Username
    const existingUser = await dbQuery(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
      [email.trim(), cleanUsername]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or Email is already registered.' });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insert User & Profile in a single Transaction
    await dbTransaction(async (client) => {
      // Insert User
      const userResult = await client.query(
        'INSERT INTO users (name, email, username, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [name.trim(), email.trim().toLowerCase(), cleanUsername, passwordHash]
      );
      
      const newUserId = userResult.rows[0].id;

      // Define default profile structure compatible with existing React UI
      const defaultProfile = {
        name: name.trim(),
        tagline: "Let's connect!",
        diamonds: "0",
        avatar: "/profile_avatar.png",
        isOnline: true,
        tags: [
          { text: "New Member", type: "role" }
        ],
        bio: "Tap the editor above to customize this bio!",
        socials: [
          {
            platform: "Instagram",
            handle: `@${cleanUsername}`,
            url: "https://instagram.com",
            icon: "Instagram",
            color: "#E1306C"
          },
          {
            platform: "LinkedIn",
            handle: name.trim(),
            url: "https://linkedin.com",
            icon: "Linkedin",
            color: "#0077B5"
          }
        ],
        quote: {
          text: "Design is not just what it looks like, it's how it connects.",
          signature: name.trim()
        }
      };

      // Insert Profile linked to user
      await client.query(
        'INSERT INTO profiles (user_id, username, profile_data) VALUES ($1, $2, $3)',
        [newUserId, cleanUsername, JSON.stringify(defaultProfile)]
      );

      // Initialize Free Plan Subscription
      await client.query(
        'INSERT INTO subscriptions (user_id, plan_id) VALUES ($1, (SELECT id FROM plans WHERE name = \'Free\'))',
        [newUserId]
      );
    });

    return res.status(201).json({
      success: true,
      user: { name: name.trim(), username: cleanUsername, email: email.trim().toLowerCase() }
    });

  } catch (err) {
    console.error('Registration serverless handler error:', err);
    return res.status(500).json({ error: 'Internal database error during user creation.' });
  }
}
