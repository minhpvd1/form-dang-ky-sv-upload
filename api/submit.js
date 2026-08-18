import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ chấp nhận POST' });

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    // Debug
    console.log('URL:', url ? url.substring(0, 30) + '...' : 'MISSING');
    console.log('KEY:', key ? key.substring(0, 20) + '...' : 'MISSING');

    if (!url || !key) {
      return res.status(500).json({ error: 'Thiếu cấu hình Supabase' });
    }

    const supabase = createClient(url, key);

    const { mssv, fullName, code, event, unit } = req.body || {};
    if (!mssv || !fullName) return res.status(400).json({ error: 'Thiếu MSSV hoặc Họ tên' });

    const now = new Date();
    const record = {
      id: Date.now(),
      mssv: mssv.trim(),
      full_name: fullName.trim(),
      code: code || '',
      event: event || 'Nhập thông tin thành viên',
      unit: unit || 'Trường Đại học Tây Nguyên',
      display_time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} • ${now.toLocaleDateString('vi-VN')}`,
      timestamp: now.toISOString(),
    };

    const { data: existing } = await supabase
      .from('members')
      .select('mssv')
      .eq('mssv', record.mssv)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(200).json({ duplicate: true, message: 'MSSV này đã đăng ký rồi' });
    }

    const { data, error } = await supabase
      .from('members')
      .insert(record)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, record: data });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
}