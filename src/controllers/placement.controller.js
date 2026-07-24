const Placement = require('../models/Placement');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

function parseBoolean(val) {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  if (typeof val === 'number') return val !== 0;
  return Boolean(val);
}

// Public: Get all active placements
async function getPlacements(req, res, next) {
  try {
    let placements = await Placement.find({ active: true }).sort({ createdAt: -1 });
    return res.status(200).json(placements);
  } catch (error) {
    next(error);
  }
}

// Admin: Get all placements (including inactive)
async function getAdminPlacements(req, res, next) {
  try {
    let placements = await Placement.find().sort({ createdAt: -1 });
    return res.status(200).json(placements);
  } catch (error) {
    next(error);
  }
}

// Admin: Create placement (expects multipart/form-data for image files)
async function createPlacement(req, res, next) {
  try {
    const { studentName, companyName, packageLPA, designation, placedYear, active } = req.body;

    if (!studentName || !companyName || !designation) {
      return res.status(400).json({ message: 'studentName, companyName, and designation are required.' });
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

    const activeBool = active !== undefined ? parseBoolean(active) : true;

    const newPlacement = await Placement.create({
      studentName,
      companyName,
      packageLPA: packageLPA ? parseFloat(packageLPA) : undefined,
      designation,
      placedYear: placedYear ? parseInt(placedYear) : undefined,
      active: activeBool,
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
    if (packageLPA !== undefined) placement.packageLPA = packageLPA ? parseFloat(packageLPA) : undefined;
    if (designation) placement.designation = designation;
    if (placedYear !== undefined) placement.placedYear = placedYear ? parseInt(placedYear) : undefined;
    if (active !== undefined) placement.active = parseBoolean(active);

    // Handle new S3 image uploads if provided, removing old images
    if (req.files) {
      if (req.files.photo && req.files.photo.length > 0) {
        if (placement.photoUrl) {
          await deleteFromS3(placement.photoUrl);
        }
        const photoFile = req.files.photo[0];
        placement.photoUrl = await uploadToS3(photoFile.buffer, photoFile.originalname, photoFile.mimetype);
      }
      if (req.files.companyLogo && req.files.companyLogo.length > 0) {
        if (placement.companyLogoUrl) {
          await deleteFromS3(placement.companyLogoUrl);
        }
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
    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: 'Placement not found.' });
    }

    // Delete associated images from S3/R2
    if (placement.photoUrl) {
      await deleteFromS3(placement.photoUrl);
    }
    if (placement.companyLogoUrl) {
      await deleteFromS3(placement.companyLogoUrl);
    }

    await Placement.findByIdAndDelete(id);
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
