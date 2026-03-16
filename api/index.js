import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function handler(req, res) {
  const ua = req.headers['user-agent']?.toLowerCase() || '';
  if (ua.includes('tiktok')) {
    res.sendFile(path.join(__dirname, '../index.html'));
  } else {
    res.status(200).send('<h2>Please open this link in TikTok app</h2>');
  }
}
