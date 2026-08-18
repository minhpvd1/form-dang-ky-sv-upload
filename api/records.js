import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ chấp nhận GET' });

  try {
    const { data: records, error } = await supabase
      .from('members')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) throw error;

    return res.status(200).json({ records: records || [], total: records ? records.length : 0 });
  } catch (err) {
    console.error('Records error:', err);
    return res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
}