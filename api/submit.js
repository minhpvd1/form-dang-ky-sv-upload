import { put, list } from '@vercel/blob';

const BLOB_KEY = 'records.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ chấp nhận POST' });

  try {
    const { mssv, fullName, code, event, unit } = req.body || {};
    if (!mssv || !fullName) return res.status(400).json({ error: 'Thiếu MSSV hoặc Họ tên' });

    const now = new Date();
    const record = {
      id: Date.now().toString(),
      mssv: mssv.trim(),
      fullName: fullName.trim(),
      code: code || '',
      timestamp: now.toISOString(),
      displayTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} • ${now.toLocaleDateString('vi-VN')}`,
      event: event || 'Nhập thông tin thành viên',
      unit: unit || 'Trường Đại học Tây Nguyên',
    };

    let records = [];
    try {
      const blob = await list({ prefix: BLOB_KEY, limit: 1 });
      if (blob.blobs.length > 0) {
        const resp = await fetch(blob.blobs[0].url, {
          headers: { Authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN }
        });
        if (resp.ok) records = await resp.json();
      }
    } catch (_) {}

    if (!Array.isArray(records)) records = [];
    records.unshift(record);

    await put(BLOB_KEY, JSON.stringify(records), {
      contentType: 'application/json',
      access: 'private',
      allowOverwrite: true,
    });

    return res.status(200).json({ success: true, record, total: records.length });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
}