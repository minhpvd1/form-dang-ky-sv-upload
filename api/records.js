import { list } from '@vercel/blob';

const BLOB_KEY = 'records.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ chấp nhận GET' });

  try {
    const blob = await list({ prefix: BLOB_KEY, limit: 1 });
    if (blob.blobs.length === 0) {
      return res.status(200).json({ records: [], total: 0 });
    }

    const resp = await fetch(blob.blobs[0].url, {
      headers: { Authorization: 'Bearer ' + process.env.BLOB_READ_WRITE_TOKEN }
    });
    if (!resp.ok) {
      return res.status(200).json({ records: [], total: 0 });
    }

    const records = await resp.json();
    return res.status(200).json({ records: Array.isArray(records) ? records : [], total: Array.isArray(records) ? records.length : 0 });
  } catch (err) {
    console.error('Records error:', err);
    return res.status(200).json({ records: [], total: 0, error: err.message });
  }
}