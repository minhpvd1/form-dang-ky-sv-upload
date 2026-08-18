export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  res.status(200).json({
    hasUrl: !!url,
    urlPrefix: url ? url.substring(0, 20) + '...' : 'MISSING',
    hasKey: !!key,
    keyPrefix: key ? key.substring(0, 20) + '...' : 'MISSING',
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
}