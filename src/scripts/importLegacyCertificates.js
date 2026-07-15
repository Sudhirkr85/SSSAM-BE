require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const LegacyCertificate = require("../models/LegacyCertificate");
const connectDB = require("../config/db");

// Simple, robust CSV line parser that handles quotes
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(v => v.replace(/^"|"$/g, "").trim());
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] !== undefined ? values[index] : "";
    });
    records.push(record);
  }
  return records;
}

const importCsv = async () => {
  const csvFilePath = process.argv[2];
  if (!csvFilePath) {
    console.error("Usage: node src/scripts/importLegacyCertificates.js <path-to-csv>");
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), csvFilePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log("Connecting to database...");
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error("Could not connect to MongoDB database.");
    process.exit(1);
  }

  console.log(`Reading CSV: ${absolutePath}`);
  const csvContent = fs.readFileSync(absolutePath, "utf-8");
  const records = parseCSV(csvContent);

  console.log(`Parsed ${records.length} records. Filtering and importing completed ones...`);

  const rows = [];
  for (const row of records) {
    const status = row["Status"] || row["status"];
    if (status && status.trim().toLowerCase() === "completed") {
      const studentId = row["Student ID"] || row["student_id"] || row["studentId"];
      const fullName = row["Full Name"] || row["full_name"] || row["fullName"];
      const course = row["Course Enrolled"] || row["course_enrolled"] || row["course"];
      const batchType = row["Batch Type"] || row["batch_type"];
      const enrollDate = row["Enrollment Date"] || row["enrollment_date"] || row["enrollmentDate"];

      rows.push({
        certificateNumber: studentId,
        studentName: fullName,
        course: course,
        trainingType: batchType || "Training",
        issueDate: enrollDate ? new Date(enrollDate) : new Date(),
        sourceNote: "Imported from pre-2026 CSV student records",
      });
    }
  }

  console.log(`Found ${rows.length} completed legacy certificates. Upserting into DB...`);

  try {
    let inserted = 0;
    for (const row of rows) {
      try {
        await LegacyCertificate.updateOne(
          { certificateNumber: row.certificateNumber },
          { $set: row },
          { upsert: true }
        );
        inserted++;
      } catch (err) {
        console.warn(`Skipping certificate ${row.certificateNumber} due to error: ${err.message}`);
      }
    }
    console.log(`Successfully imported/updated ${inserted} legacy certificates.`);
  } catch (error) {
    console.error("Error during batch import:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed. Import finished.");
    process.exit(0);
  }
};

importCsv();
