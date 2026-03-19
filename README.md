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

No endpoint URL change is required for your existing frontend.

### 1) Apply Certificate

`POST /api/certificate/apply`

#### Sample Request

curl -X POST http://localhost:5000/api/certificate/apply \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Rahul Kumar",
    "phoneNumber":"9876543210",
    "email":"rahul@example.com",
    "dateOfBirth":"2000-05-20",
    "address":"Noida, Uttar Pradesh",
    "course":"Full Stack Development",
    "certificateType":"Training",
    "duration":"3 Months"
  }'

#### Success Response (201)

{
  "success": true,
  "message": "Application Submitted Successfully",
  "applicationId": "APP000001"
}

### 2) Verify Certificate

`GET /api/certificate/verify?certificateNumber=CERT000001`

#### Success Response

{
  "success": true,
  "studentName": "Rahul Kumar",
  "course": "Full Stack Development",
  "duration": "3 Months",
  "certificateNumber": "CERT000001",
  "issueDate": "2026-03-15T10:00:00.000Z",
  "instituteName": "SSSAM Academy",
  "status": "Verified"
}

### 3) Download Certificate PDF

`POST /api/certificate/download`

#### Sample Request

curl -X POST http://localhost:5000/api/certificate/download \
  -H "Content-Type: application/json" \
  -d '{
    "certificateNumber":"CERT000001",
    "dateOfBirth":"2000-05-20"
  }' --output certificate.pdf

### 4) Application Status

`GET /api/certificate/status/:applicationId`

Example: `GET /api/certificate/status/APP000001`

## Admin / Dev Utility Routes

### Approve Application

`PATCH /api/certificate/admin/:applicationId/approve`

curl -X PATCH http://localhost:5000/api/certificate/admin/APP000001/approve

### Reject Application

`PATCH /api/certificate/admin/:applicationId/reject`

curl -X PATCH http://localhost:5000/api/certificate/admin/APP000001/reject \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Details mismatch"}'

## Frontend Integration Note

Your existing HTML/CSS/Vanilla JS frontend can continue using the same API URLs:

- `POST /api/certificate/apply`
- `GET /api/certificate/verify?certificateNumber=`
- `POST /api/certificate/download`
- `GET /api/certificate/status/:applicationId`

No endpoint change is required.
