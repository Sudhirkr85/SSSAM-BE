const StudyNotes = require('../models/StudyNotes');
const Enquiry = require('../models/Enquiry');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');
const { generateEnquiryId } = require('../utils/enquiryId');

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

// Public: Get all active notes
async function getNotes(req, res, next) {
  try {
    const notes = await StudyNotes.find({ active: true }).sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}

// Public: Get a single note by ID or slug-style identifier
async function getNoteById(req, res, next) {
  try {
    const { id } = req.params;
    let note;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      note = await StudyNotes.findById(id);
    }
    // If not found by ObjectId (or id is a slug), search by title slug match
    if (!note) {
      const allNotes = await StudyNotes.find({ active: true });
      note = allNotes.find(n => {
        const slug = n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return slug === id || String(n._id) === id;
      });
    }
    if (!note || !note.active) {
      return res.status(404).json({ message: 'Study note not found.' });
    }
    return res.status(200).json(note);
  } catch (error) {
    next(error);
  }
}

// Admin: Get all notes (including inactive)
async function getAdminNotes(req, res, next) {
  try {
    const notes = await StudyNotes.find().sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}

// Public: Gated download lead submission
async function downloadNoteAndSaveLead(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, email, course } = req.body;

    if (!fullName || !phoneNumber) {
      return res.status(400).json({ message: 'fullName and phoneNumber are required to download study notes.' });
    }

    let note;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      note = await StudyNotes.findById(id);
    }
    // If not found by ObjectId (or id is a slug), search by title slug match
    if (!note) {
      const allNotes = await StudyNotes.find({ active: true });
      note = allNotes.find(n => {
        const slug = n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return slug === id || String(n._id) === id;
      });
    }
    if (!note || !note.active) {
      return res.status(404).json({ message: 'Study notes not found.' });
    }

    // Increment download counter
    note.downloadCount += 1;
    await note.save();

    // Create a new Enquiry lead
    const newLead = await Enquiry.create({
      enquiryId: generateEnquiryId(),
      fullName,
      phoneNumber,
      email: email || null,
      course: course || 'Others',
      customCourseName: (course && course !== 'Others') ? undefined : 'Study Notes Download',
      message: `[LEAD FROM STUDY NOTES] Downloaded file: ${note.title}`,
    });

    return res.status(200).json({
      message: 'Lead captured successfully.',
      fileUrl: note.fileUrl,
    });
  } catch (error) {
    next(error);
  }
}

// Admin: Create Study Notes (expects multer single file upload)
async function createNote(req, res, next) {
  try {
    const { title, description, category, active } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'title, description, and category are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF document is required.' });
    }

    const fileUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    const activeBool = active !== undefined ? parseBoolean(active) : true;

    const newNote = await StudyNotes.create({
      title,
      description,
      category,
      active: activeBool,
      fileUrl,
    });

    return res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
}

// Admin: Update Study Notes
async function updateNote(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, active } = req.body;

    const note = await StudyNotes.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Study notes not found.' });
    }

    if (title) note.title = title;
    if (description) note.description = description;
    if (category) note.category = category;
    if (active !== undefined) note.active = parseBoolean(active);

    if (req.file) {
      if (note.fileUrl) {
        await deleteFromS3(note.fileUrl);
      }
      note.fileUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    await note.save();
    return res.status(200).json(note);
  } catch (error) {
    next(error);
  }
}

// Admin: Delete Study Notes
async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    const note = await StudyNotes.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Study notes not found.' });
    }

    // Delete PDF file from S3/R2
    if (note.fileUrl) {
      await deleteFromS3(note.fileUrl);
    }

    await StudyNotes.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Study notes deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotes,
  getNoteById,
  getAdminNotes,
  downloadNoteAndSaveLead,
  createNote,
  updateNote,
  deleteNote,
};
