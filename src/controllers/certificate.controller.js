const {
  applyForCertificate,
  verifyCertificate,
  getApplicationStatus,
  getCertificateForDownload,
} = require("../services/certificate.service");

const { generateCertificatePdf } = require("../services/pdf.service");
const { sendSuccess } = require("../utils/response");

// 🇮🇳 Date formatter
const formatIndianDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

// APPLY
const applyCertificate = async (req, res, next) => {
  try {
    const application = await applyForCertificate(req.body);

    return sendSuccess(res, 201, {
      message: "Application Submitted Successfully",
      applicationId: application.applicationId,
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY
const verifyCertificateByNumber = async (req, res, next) => {
  try {
    const { certificateNumber } = req.query;

    if (!certificateNumber) {
      return res
        .status(400)
        .json({ message: "Certificate number is required" });
    }

    const record = await verifyCertificate(certificateNumber);

    // PARSING LOGIC
    let cleanCourse = record.course;
    let organization = "";
    const firstParenOpen = record.course.indexOf('(');
    if (firstParenOpen > -1) {
      let rawOrg = record.course.substring(firstParenOpen + 1);
      if (rawOrg.endsWith(')')) {
        rawOrg = rawOrg.slice(0, -1);
      }
      organization = rawOrg.trim();
      
      // Strip nested abbreviation if exists, e.g. "IITM (Institute...)"
      const nestedParenOpen = organization.indexOf('(');
      if (nestedParenOpen > -1) {
        let innerOrg = organization.substring(nestedParenOpen + 1);
        if (innerOrg.endsWith(')')) {
          innerOrg = innerOrg.slice(0, -1);
        }
        organization = innerOrg.trim();
      }
      
      cleanCourse = record.course.substring(0, firstParenOpen).trim();
    }

    let cleanDuration = record.duration;
    let durationDates = "";
    if (record.duration.includes(" | Duration: ")) {
      const parts = record.duration.split(" | Duration: ");
      cleanDuration = parts[0].trim();
      durationDates = parts[1].trim();
    }

    const responseData = {
      studentName: record.fullName,
      course: cleanCourse,
      organization: organization,
      duration: cleanDuration,
      durationDates: durationDates,
      certificateType: record.certificateType,
      status: record.status,
      certificateNumber: record.certificateNumber,
      issueDate: record.issueDate,
    };

    console.log("Verification result:", responseData);
    return sendSuccess(res, 200, responseData);
  } catch (error) {
    next(error);
  }
};

const downloadCertificate = async (req, res, next) => {
  try {
    const { certificateNumber, dateOfBirth } = req.body;

    if (!certificateNumber || !dateOfBirth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const record = await getCertificateForDownload(
      certificateNumber,
      dateOfBirth,
    );

    if (record.isLegacy) {
      if (!record.pdfUrl) {
        return res.status(200).json({
          success: true,
          canReissueManually: true,
          message: "Certificate verified but PDF not digitized yet. Please contact SSSAM Academy support to request a reissued copy."
        });
      }
      return res.status(200).json({
        success: true,
        pdfUrl: record.pdfUrl
      });
    }

    const filename = `certificate-${record.certificateNumber.replace(/\//g, "_")}.pdf`;

    // Try reading file if pdfPath exists
    if (record.pdfPath) {
      const fs = require("fs").promises;
      const path = require("path");
      const fullPdfPath = path.resolve(__dirname, "../../..", record.pdfPath.replace(/^\//, ""));
      try {
        const fileBuffer = await fs.readFile(fullPdfPath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return res.status(200).send(fileBuffer);
      } catch (err) {
        console.warn(`Saved PDF file not found at ${fullPdfPath}, generating dynamically...`);
      }
    }

    const pdfBuffer = await generateCertificatePdf(record);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// STATUS
const getStatusByApplicationId = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { dateOfBirth } = req.query;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }

    const application = await getApplicationStatus(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // DOB Validation
    if (dateOfBirth) {
      const reqDobStr = new Date(dateOfBirth).toISOString().split('T')[0];
      const appDobStr = new Date(application.dateOfBirth).toISOString().split('T')[0];
      if (reqDobStr !== appDobStr) {
        return res.status(400).json({ message: "Invalid details: Date of birth mismatch." });
      }
    }

    // PARSING LOGIC FOR STATUS RESPONSE
    let cleanCourse = application.course;
    let organization = "";
    const firstParenOpen = application.course.indexOf('(');
    if (firstParenOpen > -1) {
      let rawOrg = application.course.substring(firstParenOpen + 1);
      if (rawOrg.endsWith(')')) {
        rawOrg = rawOrg.slice(0, -1);
      }
      organization = rawOrg.trim();
      
      // Strip nested abbreviation if exists, e.g. "IITM (Institute...)"
      const nestedParenOpen = organization.indexOf('(');
      if (nestedParenOpen > -1) {
        let innerOrg = organization.substring(nestedParenOpen + 1);
        if (innerOrg.endsWith(')')) {
          innerOrg = innerOrg.slice(0, -1);
        }
        organization = innerOrg.trim();
      }
      
      cleanCourse = application.course.substring(0, firstParenOpen).trim();
    }

    let cleanDuration = application.duration;
    let durationDates = "";
    if (application.duration && application.duration.includes(" | Duration: ")) {
      const parts = application.duration.split(" | Duration: ");
      cleanDuration = parts[0].trim();
      durationDates = parts[1].trim();
    }

    const responseData = {
      name: application?.fullName || application?.name,
      course: cleanCourse,
      organization: organization,
      duration: cleanDuration,
      durationDates: durationDates,
      certificateType: application?.certificateType,
      status: application?.status,
      ...(application?.status?.toLowerCase() === "approved" && {
        certificateNumber: application?.certificateNumber,
        issueDate: application.issueDate,
      }),
    };

    return sendSuccess(res, 200, responseData);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  applyCertificate,
  verifyCertificateByNumber,
  downloadCertificate,
  getStatusByApplicationId,
};
