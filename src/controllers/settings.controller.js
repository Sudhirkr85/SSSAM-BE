const SystemSettings = require('../models/SystemSettings');

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
    let setting = await SystemSettings.findOneAndUpdate(
      { key },
      { value },
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
