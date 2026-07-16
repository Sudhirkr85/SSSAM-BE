const Placement = require('../models/Placement');
const { uploadToS3 } = require('../utils/s3');

// Public: Get all active placements
async function getPlacements(req, res, next) {
  try {
    let placements = await Placement.find({ active: true }).sort({ createdAt: -1 });
    if (!placements || placements.length === 0) {
      const { mockPlacements } = require('../config/mockData');
      placements = mockPlacements.filter(p => p.active);
    }
    return res.status(200).json(placements);
  } catch (error) {
    next(error);
  }
}

// Admin: Get all placements (including inactive)
async function getAdminPlacements(req, res, next) {
  try {
    let placements = await Placement.find().sort({ createdAt: -1 });
    if (!placements || placements.length === 0) {
      const { mockPlacements } = require('../config/mockData');
      placements = mockPlacements;
    }
    return res.status(200).json(placements);
  } catch (error) {
    next(error);
  }
}

// Admin: Create placement (expects multipart/form-data for image files)
async function createPlacement(req, res, next) {
  try {
    const { studentName, companyName, packageLPA, designation, placedYear, active } = req.body;

    if (!studentName || !companyName || !packageLPA || !designation) {
      return res.status(400).json({ message: 'studentName, companyName, packageLPA, and designation are required.' });
    }

    if (!req.files || !req.files.photo) {
      return res.status(400).json({ message: 'student photo is required.' });
    }

    const photoFile = req.files.photo[0];
    const photoUrl = await uploadToS3(photoFile.buffer, photoFile.originalname, photoFile.mimetype);

    let companyLogoUrl = '';
    if (req.files.companyLogo) {
      const logoFile = req.files.companyLogo[0];
      companyLogoUrl = await uploadToS3(logoFile.buffer, logoFile.originalname, logoFile.mimetype);
    }

    const newPlacement = await Placement.create({
      studentName,
      companyName,
      packageLPA: parseFloat(packageLPA),
      designation,
      placedYear: placedYear ? parseInt(placedYear) : undefined,
      active: active !== undefined ? (active === 'true' || active === true) : true,
      photoUrl,
      companyLogoUrl,
    });

    return res.status(201).json(newPlacement);
  } catch (error) {
    next(error);
  }
}

// Admin: Update placement
async function updatePlacement(req, res, next) {
  try {
    const { id } = req.params;
    const { studentName, companyName, packageLPA, designation, placedYear, active } = req.body;

    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: 'Placement not found.' });
    }

    if (studentName) placement.studentName = studentName;
    if (companyName) placement.companyName = companyName;
    if (packageLPA) placement.packageLPA = parseFloat(packageLPA);
    if (designation) placement.designation = designation;
    if (placedYear) placement.placedYear = parseInt(placedYear);
    if (active !== undefined) placement.active = active === 'true' || active === true;

    // Handle new S3 image uploads if provided
    if (req.files) {
      if (req.files.photo) {
        const photoFile = req.files.photo[0];
        placement.photoUrl = await uploadToS3(photoFile.buffer, photoFile.originalname, photoFile.mimetype);
      }
      if (req.files.companyLogo) {
        const logoFile = req.files.companyLogo[0];
        placement.companyLogoUrl = await uploadToS3(logoFile.buffer, logoFile.originalname, logoFile.mimetype);
      }
    }

    await placement.save();
    return res.status(200).json(placement);
  } catch (error) {
    next(error);
  }
}

// Admin: Delete placement
async function deletePlacement(req, res, next) {
  try {
    const { id } = req.params;
    const placement = await Placement.findByIdAndDelete(id);
    if (!placement) {
      return res.status(404).json({ message: 'Placement not found.' });
    }
    return res.status(200).json({ message: 'Placement deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlacements,
  getAdminPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
};
