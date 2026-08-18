import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return res.status(500).json({ error: 'Thiếu cấu hình Supabase' });

  const supabase = createClient(url, key);

  try {
    // GET — lấy danh sách
    if (req.method === 'GET') {
      const { data: records, error } = await supabase
        .from('members')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10000);

      if (error) throw error;
      return res.status(200).json({ records: records || [], total: records ? records.length : 0 });
    }

    // DELETE — xoá theo mssv
    if (req.method === 'DELETE') {
      const { mssv, id } = req.body || req.query || {};
      const deleteKey = mssv || id;

      if (!deleteKey) return res.status(400).json({ error: 'Thiếu MSSV hoặc ID để xoá' });

      // Xoá tất cả
      if (deleteKey === '__all__') {
        const { data, error } = await supabase.from('members').delete().neq('id', 0).select();
        if (error) throw error;
        return res.status(200).json({ success: true, deleted: data || [], all: true });
      }

      let query = supabase.from('members').delete();
      if (mssv) query = query.eq('mssv', mssv);
      else if (id) query = query.eq('id', id);

      const { data, error } = await query.select();
      if (error) throw error;

      return res.status(200).json({ success: true, deleted: data || [] });
    }

    // PUT — cập nhật theo mssv
    if (req.method === 'PUT') {
      const { mssv, fullName, code, event, unit } = req.body || {};
      if (!mssv) return res.status(400).json({ error: 'Thiếu MSSV để cập nhật' });

      const updates = {};
      if (fullName) updates.full_name = fullName;
      if (code !== undefined) updates.code = code;
      if (event) updates.event = event;
      if (unit) updates.unit = unit;

      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('mssv', mssv)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, updated: data || [] });
    }

    return res.status(405).json({ error: 'Phương thức không hỗ trợ' });
  } catch (err) {
    console.error('Records error:', err);
    return res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
}