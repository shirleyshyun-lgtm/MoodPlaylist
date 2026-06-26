require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }

  const { password } = body || {};
  const days = parseInt(req.query.days) || 7;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  // Check password from database
  try {
    const { data: adminUser, error: authError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('password', password)
      .single();

    if (authError || !adminUser) {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (e) {
    // Fallback to env var if admin_users table doesn't exist
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }
  }

  try {
    const { data: allStats, error } = await supabase
      .from('playlist_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayStats = allStats.filter(s => new Date(s.created_at) >= today);
    const weekStats = allStats.filter(s => new Date(s.created_at) >= weekAgo);
    const errors = allStats.filter(s => s.status === 'error');
    const todayErrors = todayStats.filter(s => s.status === 'error');

    // Hourly distribution
    const hourCounts = new Array(24).fill(0);
    allStats.forEach(s => {
      const hour = new Date(s.created_at).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    // Daily stats
    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const count = allStats.filter(s => {
        const created = new Date(s.created_at);
        return created >= dayStart && created < dayEnd;
      }).length;
      dailyStats.push({ date: dayStart.toISOString().split('T')[0], count });
    }

    res.json({
      total: allStats.length,
      today: todayStats.length,
      thisWeek: weekStats.length,
      errorsToday: todayErrors.length,
      totalErrors: errors.length,
      peakHour: `${peakHour}:00 - ${peakHour + 1}:00`,
      dailyStats,
      recentErrors: errors.slice(0, 5).map(e => ({
        time: e.created_at,
        message: e.error_message
      }))
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
