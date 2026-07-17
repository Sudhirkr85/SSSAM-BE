const SystemSettings = require('../models/SystemSettings');

// ===============================
// YOUTUBE LINK → EMBED CONVERTER
// ===============================
function convertToYouTubeEmbed(url) {
  if (!url || typeof url !== 'string') return url;

  // Already an embed link — return as-is
  if (url.includes('youtube.com/embed/')) return url;

  let videoId = null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '');

    if (hostname === 'youtu.be') {
      // https://youtu.be/VIDEO_ID
      videoId = parsed.pathname.replace('/', '');
    } else if (hostname === 'youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) {
        // https://www.youtube.com/shorts/VIDEO_ID
        videoId = parsed.pathname.replace('/shorts/', '');
      } else {
        // https://www.youtube.com/watch?v=VIDEO_ID
        videoId = parsed.searchParams.get('v');
      }
    }
  } catch (_) {
    // Not a valid URL — return original
    return url;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Could not extract ID — return original
  return url;
}

// Get a setting key (Public)
async function getSetting(req, res, next) {
  try {
    const { key } = req.params;
    let setting = await SystemSettings.findOne({ key });
    if (!setting) {
      // Return default values for known settings
      if (key === 'apply_guide_video_url') {
        return res.status(200).json({ key, value: 'https://www.youtube.com/embed/dQw4w9WgXcQ' });
      }
      return res.status(404).json({ message: 'Setting not found' });
    }
    return res.status(200).json(setting);
  } catch (error) {
    next(error);
  }
}

// Update or create a setting (Admin)
async function updateSetting(req, res, next) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'key and value are required.' });
    }

    // Auto-convert YouTube link to embed URL
    const finalValue = key === 'apply_guide_video_url'
      ? convertToYouTubeEmbed(value)
      : value;

    let setting = await SystemSettings.findOneAndUpdate(
      { key },
      { value: finalValue },
      { new: true, upsert: true }
    );
    return res.status(200).json(setting);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSetting,
  updateSetting,
};
