const path = require('path');

export default function handler(req, res) {
  const ua = req.headers['user-agent'].toLowerCase();
  if (ua.includes('tiktok')) {
    // TikTok users → send index.html
    res.sendFile(path.join(__dirname, '../index.html'));
  } else {
    // Non-TikTok → blank or message
    res.status(200).send('<h2>Please open this link in TikTok app</h2>');
  }
}
