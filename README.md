# SSSAM Academy Backend

Production-ready Node.js backend for certificate application, verification, status tracking, and PDF download.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Joi validation
- PDFKit for dynamic certificate PDF generation
- Security and ops: `helmet`, `cors`, `morgan`, `express-rate-limit`, `dotenv`

## Project Structure

backend/
  src/
    config/
      db.js
    models/
      CertificateApplication.js
      CertificateRecord.js
    validators/
      certificate.validator.js
    services/
      certificate.service.js
      pdf.service.js
    controllers/
      certificate.controller.js
    routes/
      certificate.routes.js
    middlewares/
      errorHandler.js
      notFound.js
    utils/
      appId.js
      certNumber.js
      response.js
    server.js
  .env.example
  package.json
  README.md

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

## Installation

1. Open terminal in `backend` folder.
2. Install dependencies:

   npm install

3. Create env file:

   Copy `.env.example` to `.env` and update values.

## Environment Setup

Use the following variables in `.env`:

MONGODB_URI=mongodb://127.0.0.1:27017/sssam_academy
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5500

## Run Backend

### Development

npm run dev

### Production

npm start

## API Endpoints (Frontend Compatible)

### 1) Apply Certificate
`POST /api/certificate/apply`

Submits a new certificate application.

#### Payloads by Certificate Type:

##### A) Regular Training (Training) / Internship
* `qualification` and `organization` keys are completely omitted.
```json
{
  "fullName": "Himanshi Yadav",
  "phoneNumber": "9980776658",
  "email": "himanshi@example.com",
  "dateOfBirth": "2003-09-20",
  "course": "Cybersecurity & Ethical Hacking",
  "certificateType": "Training",
  "duration": "3 Months",
  "durationDates": "June 16th - September 16th 2025"
}
```

##### B) Workshop
* `qualification`, `organization`, and `durationDates` are completely omitted.
```json
{
  "fullName": "Himanshi Yadav",
  "phoneNumber": "9980776658",
  "email": "himanshi@example.com",
  "dateOfBirth": "2003-09-20",
  "course": "Cybersecurity & Ethical Hacking",
  "certificateType": "Workshop",
  "duration": "4 Days"
}
```

##### C) College Training (Academic Training) / Corporate Training
```json
{
  "fullName": "Himanshi Yadav",
  "phoneNumber": "9980776658",
  "email": "himanshi@example.com",
  "dateOfBirth": "2003-09-20",
  "qualification": "B-Tech",
  "course": "Cybersecurity & Ethical Hacking",
  "organization": "Institute of Information Technology & Management",
  "certificateType": "Academic Training",
  "duration": "100 Hours",
  "durationDates": "June 16th - July 31st 2025"
}
```

---

### 2) Verify Certificate
`GET /api/certificate/verify?certificateNumber=SSSAM/CERT/408012`

Queries certificate authenticity. Automatically supports legacy pre-2026 CSV entries and new approved database records.

#### Response (200 OK)
```json
{
  "success": true,
  "studentName": "Himanshi Yadav",
  "course": "CYBERSECURITY & ETHICAL HACKING",
  "duration": "3-Month",
  "certificateNumber": "SSSAM/CERT/408012",
  "issueDate": "15 July 2026",
  "instituteName": "SSSAM Academy",
  "status": "Verified",
  "organization": "SSSAM Academy"
}
```

---

### 3) Download Certificate PDF
`POST /api/certificate/download`

Generates and downloads the verified certificate PDF file.

#### Request Payload
```json
{
  "certificateNumber": "SSSAM/CERT/408012",
  "dateOfBirth": "2003-09-20"
}
```
*Returns the PDF binary stream.*

---

### 4) Check Application Status
`GET /api/certificate/status/:applicationId`

Example: `GET /api/certificate/status/APP8012`

#### Response (200 OK)
```json
{
  "success": true,
  "name": "Himanshi Yadav",
  "course": "Cybersecurity & Ethical Hacking",
  "certificateType": "Training",
  "status": "Approved",
  "certificateNumber": "SSSAM/CERT/408012",
  "issueDate": "15 July 2026"
}
```

---

### 5) Book Demo Class / Submit Enquiry
`POST /api/enquiry/demo-class`

#### Request Payload
```json
{
  "fullName": "Rahul Kumar",
  "phoneNumber": "9876543210",
  "email": "rahul@example.com",
  "course": "Data Science",
  "customCourseName": "",
  "demoType": "Online",
  "message": "Interested in python course"
}
```

---

### 6) Check Enquiry Status
`GET /api/enquiry/status/:enquiryId`

---

### 7) Get Course List
`GET /api/courses`

---

### 8) Get Organization List
`GET /api/organizations`

---

## Admin / Dev Utility Routes

### Approve Application
`PATCH /api/admin/certificate/:applicationId/approve`

### Reject Application
`PATCH /api/admin/certificate/:applicationId/reject`

```json
{
  "remarks": "Details mismatch"
}
```
