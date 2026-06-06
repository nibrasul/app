import { dbQuery } from '../../database/neon.js';
import { withAuth } from '../../middleware/auth.js';

async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const userId = req.user.id;

  try {
    // 1. Resolve user profile ID
    const profileRes = await dbQuery('SELECT id FROM profiles WHERE user_id = $1', [userId]);
    if (profileRes.length === 0) {
      return res.status(200).json({
        totalViews: 0,
        viewsOverTime: [],
        countries: [],
        devices: [],
        clicks: [],
        recentViews: [],
        recentClicks: []
      });
    }

    const profileId = profileRes[0].id;

    // 2. Fetch total view count
    const totalViewsRes = await dbQuery(
      'SELECT COUNT(*) as count FROM profile_views WHERE profile_id = $1',
      [profileId]
    );
    const totalViews = parseInt(totalViewsRes[0].count);

    // 3. Fetch views over time (grouped by day, last 7 days)
    const viewsOverTime = await dbQuery(`
      SELECT DATE(viewed_at) as date, COUNT(*) as count 
      FROM profile_views 
      WHERE profile_id = $1 AND viewed_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(viewed_at) 
      ORDER BY date ASC
    `, [profileId]);

    // 4. Fetch country distribution
    const countries = await dbQuery(`
      SELECT country_code as country, COUNT(*) as count 
      FROM profile_views 
      WHERE profile_id = $1 
      GROUP BY country_code 
      ORDER BY count DESC 
      LIMIT 10
    `, [profileId]);

    // 5. Fetch device categories breakdown
    const devices = await dbQuery(`
      SELECT device_type as device, COUNT(*) as count 
      FROM profile_views 
      WHERE profile_id = $1 
      GROUP BY device_type 
      ORDER BY count DESC
    `, [profileId]);

    // 6. Fetch link clicks analytics
    const clicks = await dbQuery(`
      SELECT platform, COUNT(*) as count 
      FROM click_events 
      WHERE profile_id = $1 
      GROUP BY platform 
      ORDER BY count DESC
    `, [profileId]);

    // 7. Fetch raw lists of recent views and clicks for the dashboard activity log
    const recentViews = await dbQuery(`
      SELECT id, country_code, device_type, viewed_at 
      FROM profile_views 
      WHERE profile_id = $1 
      ORDER BY viewed_at DESC 
      LIMIT 25
    `, [profileId]);

    const recentClicks = await dbQuery(`
      SELECT id, platform, device_type, clicked_at 
      FROM click_events 
      WHERE profile_id = $1 
      ORDER BY clicked_at DESC 
      LIMIT 25
    `, [profileId]);

    return res.status(200).json({
      totalViews,
      viewsOverTime: viewsOverTime.map(row => {
        let dateStr = '';
        if (row.date instanceof Date) {
          dateStr = row.date.toISOString().split('T')[0];
        } else if (typeof row.date === 'string') {
          dateStr = row.date.split('T')[0];
        } else if (row.date) {
          dateStr = new Date(row.date).toISOString().split('T')[0];
        }
        return {
          date: dateStr,
          count: parseInt(row.count)
        };
      }),
      countries: countries.map(row => ({
        country: row.country === 'unknown' ? 'Unknown' : row.country,
        count: parseInt(row.count)
      })),
      devices: devices.map(row => ({
        device: row.device || 'Desktop',
        count: parseInt(row.count)
      })),
      clicks: clicks.map(row => ({
        platform: row.platform === 'nfc_tap' ? 'NFC Taps' : row.platform,
        count: parseInt(row.count)
      })),
      recentViews: recentViews.map(row => ({
        id: row.id,
        country_code: row.country_code,
        device_type: row.device_type,
        viewed_at: row.viewed_at
      })),
      recentClicks: recentClicks.map(row => ({
        id: row.id,
        platform: row.platform,
        device_type: row.device_type,
        clicked_at: row.clicked_at
      }))
    });

  } catch (err) {
    console.error('Analytics fetch serverless handler error:', err);
    return res.status(500).json({ error: 'Database error occurred while compiling analytics.' });
  }
}

export default withAuth(handler);
