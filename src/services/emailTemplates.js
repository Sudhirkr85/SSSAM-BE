// ===============================
// 🎓 STUDENT EMAIL TEMPLATE
// ===============================
function getStudentEmailTemplate(data) {

  const statusColor =
    data.status === "Approved"
      ? "#16a34a"
      : data.status === "Rejected"
      ? "#dc2626"
      : "#f59e0b";

  const whatsappLink = `https://wa.me/919217031899?text=Hello%20SSSAM%20Academy,%20I%20need%20help%20with%20my%20Application%20ID:%20${data.applicationId}`;

  return `
  <div style="background:#f5f5f5;font-family:Segoe UI,Arial;">
    
    <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:18px;
                box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">
      
      <div style="background:#111;padding:20px;text-align:center;color:#fff;">
        <h2 style="margin:0;">SSSAM Academy</h2>
        <p style="font-size:12px;color:#ccc;">Smart Solution School of AI & ML</p>
      </div>

      <div style="padding:25px;">
        
        <p>Hello <b>${data.name}</b>,</p>

        <span style="background:${statusColor};color:#fff;padding:5px 12px;
                     border-radius:20px;font-size:12px;">
          ${data.status}
        </span>

        <p style="margin-top:10px;">${data.statusMessage}</p>

        <div style="background:#fafafa;padding:15px;border-radius:10px;margin-top:15px;">
          <p><b>Course:</b> ${data.course}</p>
          <p><b>Certificate Type:</b> ${data.certificateType}</p>

          ${
            data.status === "Approved"
              ? `<p><b>Certificate Number:</b> ${data.certificateNumber}</p>`
              : `<p><b>Application ID:</b> ${data.applicationId}</p>`
          }

          <p><b>Duration:</b> ${data.duration}</p>
        </div>

        <!-- TRACK BUTTON -->
        <div style="text-align:center;margin-top:20px;">
          <a href="https://sssamacademy.com"
             style="background:#111;color:#fff;padding:12px 25px;
                    border-radius:8px;text-decoration:none;">
            Track Application
          </a>
        </div>

        <!-- WHATSAPP BUTTON -->
        <div style="text-align:center;margin-top:10px;">
          <a href="${whatsappLink}"
             style="background:#25D366;color:#fff;padding:10px 22px;
                    border-radius:8px;text-decoration:none;">
            Chat on WhatsApp
          </a>
        </div>

      </div>

      <div style="text-align:center;padding:10px;font-size:12px;color:#888;">
        SSSAM Academy • Gurugram
      </div>

    </div>
  </div>
  `;
}

// ===============================
// 👨‍💼 ADMIN EMAIL TEMPLATE
// ===============================
function getAdminEmailTemplate(data) {

  const callLink = `tel:${data.phoneNumber}`;
  const whatsappLink = `https://wa.me/91${data.phoneNumber}?text=Hello%20${data.name},%20regarding%20your%20course%20(${data.course})%20enquiry`;

  return `
  <div style="background:#f4f4f4;font-family:Segoe UI,Arial;">
    
    <div style="max-width:520px;margin:30px auto;background:#fff;border-radius:16px;
                box-shadow:0 8px 25px rgba(0,0,0,0.08);overflow:hidden;">
      
      <!-- HEADER -->
      <div style="background:#111;color:#fff;padding:18px;text-align:center;">
        <h2 style="margin:0;">New Course Enquiry</h2>
        <p style="font-size:12px;color:#ccc;">SSSAM Academy Admin Panel</p>
      </div>

      <!-- BODY -->
      <div style="padding:20px;">
        
        <!-- PROFESSIONAL MESSAGE -->
        <p style="font-size:14px;color:#333;">
          A new enquiry has been received regarding the course 
          "<b>${data.course}</b>".
        </p>

        <p style="font-size:13px;color:#666;">
          Please review the student details and respond quickly for better conversion.
        </p>

        <!-- DETAILS CARD -->
        <div style="background:#fafafa;padding:15px;border-radius:10px;border:1px solid #eee;margin-top:15px;">
          
          <p><b>Name:</b> ${data.name}</p>
          
          <p><b>Email:</b> 
            <a href="mailto:${data.email}" style="color:#111;text-decoration:none;">
              ${data.email}
            </a>
          </p>

          <p><b>Phone:</b> 
            <a href="${callLink}" style="color:#16a34a;text-decoration:none;">
              ${data.phoneNumber}
            </a>
          </p>

          <p><b>Course:</b> ${data.course}</p>
          <p><b>Enquiry Type:</b> Course Enquiry</p>
          <p><b>Class Mode:</b> ${data.duration}</p>
          <p><b>Date:</b> ${data.date}</p>

        </div>

        <!-- ACTION BUTTONS -->
        <div style="text-align:center;margin-top:20px;">
          
          <a href="${callLink}"
             style="background:#111;color:#fff;padding:10px 20px;
                    border-radius:8px;text-decoration:none;margin-right:5px;">
            Call Student
          </a>

          <a href="${whatsappLink}"
             style="background:#25D366;color:#fff;padding:10px 20px;
                    border-radius:8px;text-decoration:none;">
            WhatsApp
          </a>

        </div>

      </div>

      <!-- FOOTER -->
      <div style="text-align:center;padding:10px;font-size:12px;color:#777;">
        Admin Notification • SSSAM Academy
      </div>

    </div>
  </div>
  `;
}
// ===============================
// ===============================
// 🏫 SEMINAR BOOKING ADMIN TEMPLATE
// ===============================
function getSeminarAdminEmailTemplate(data) {
  const callLink = `tel:${data.mobileNumber}`;
  const whatsappLink = `https://wa.me/91${data.mobileNumber}?text=Hello%20${encodeURIComponent(data.coordinatorName)},%20regarding%20your%20seminar%20request%20on%20${encodeURIComponent(data.topic)}.`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:560px;margin:30px auto;background:#111827;border:1px solid rgba(224,167,48,0.3);border-radius:18px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.5);">
      
      <!-- HEADER -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:28px 24px;text-align:center;border-bottom:2px solid #e0a730;">
        <div style="display:inline-block;background:rgba(224,167,48,0.15);border:1px solid #e0a730;border-radius:50%;width:54px;height:54px;line-height:54px;font-size:26px;color:#e0a730;margin-bottom:10px;">
          🎓
        </div>
        <h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">New Seminar Request Received</h2>
        <p style="margin:6px 0 0;color:#e0a730;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">SSSAM Academy • College Outreach</p>
      </div>

      <!-- BODY CONTENT -->
      <div style="padding:28px 24px;">
        <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">
          A new college seminar booking request has been submitted on the website. Below are the coordinator details:
        </p>

        <!-- DETAILS CARD -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#cbd5e1;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:120px;font-weight:600;">Booking ID:</td>
              <td style="padding:8px 0;color:#e0a730;font-family:monospace;font-weight:700;font-size:15px;">${data.bookingId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">College:</td>
              <td style="padding:8px 0;color:#ffffff;font-weight:700;">${data.collegeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Coordinator:</td>
              <td style="padding:8px 0;color:#ffffff;">${data.coordinatorName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Mobile:</td>
              <td style="padding:8px 0;"><a href="${callLink}" style="color:#38bdf8;text-decoration:none;font-weight:600;">${data.mobileNumber}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Email:</td>
              <td style="padding:8px 0;"><a href="mailto:${data.email || ''}" style="color:#cbd5e1;text-decoration:none;">${data.email || 'Not provided'}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Seminar Topic:</td>
              <td style="padding:8px 0;color:#f8fafc;font-weight:700;">${data.topic}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Date & Time:</td>
              <td style="padding:8px 0;color:#94a3b8;font-size:13px;">${data.date}</td>
            </tr>
          </table>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="display:flex;gap:12px;text-align:center;">
          <a href="${callLink}" style="flex:1;display:inline-block;background:linear-gradient(135deg, #e0a730 0%, #c99324 100%);color:#111827;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;box-shadow:0 4px 14px rgba(224,167,48,0.3);">
            📞 Call Coordinator
          </a>
          <a href="${whatsappLink}" style="flex:1;display:inline-block;background:#25D366;color:#ffffff;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;box-shadow:0 4px 14px rgba(37,211,102,0.3);">
            💬 Open WhatsApp
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#0f172a;padding:16px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05);">
        Admin Notification • SSSAM Academy Sector 14 Gurugram
      </div>
    </div>
  </body>
  </html>`;
}

// ===============================
// 🏫 SEMINAR BOOKING CONFIRMATION TEMPLATE (for coordinator)
// ===============================
function getSeminarConfirmationEmailTemplate(data) {
  const whatsappLink = `https://wa.me/919217031899?text=Hello%20SSSAM%20Academy,%20I%20want%20to%20follow%20up%20on%20my%20seminar%20request%20(ID:%20${data.bookingId})`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:560px;margin:30px auto;background:#111827;border:1px solid rgba(224,167,48,0.3);border-radius:18px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.5);">
      
      <!-- HEADER -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:28px 24px;text-align:center;border-bottom:2px solid #e0a730;">
        <h1 style="margin:0 0 6px;color:#e0a730;font-size:24px;font-weight:900;letter-spacing:-0.5px;">SSSAM ACADEMY</h1>
        <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">Free IT Seminar Request Received ✅</p>
      </div>

      <!-- BODY CONTENT -->
      <div style="padding:28px 24px;">
        <p style="margin:0 0 14px;color:#f8fafc;font-size:15px;line-height:1.6;">
          Dear <b>${data.coordinatorName}</b>,
        </p>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
          Thank you for reaching out! We have received your request for a free technical seminar at <b>${data.collegeName}</b>. Our academic coordinator will contact you within 24 hours to align dates and logistics.
        </p>

        <!-- SUMMARY CARD -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#cbd5e1;">
            <tr>
              <td style="padding:6px 0;color:#94a3b8;width:120px;font-weight:600;">Booking ID:</td>
              <td style="padding:6px 0;color:#e0a730;font-family:monospace;font-weight:700;">${data.bookingId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-weight:600;">College:</td>
              <td style="padding:6px 0;color:#ffffff;font-weight:600;">${data.collegeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-weight:600;">Tech Topic:</td>
              <td style="padding:6px 0;color:#ffffff;font-weight:600;">${data.topic}</td>
            </tr>
          </table>
        </div>

        <!-- WHATSAPP CTA -->
        <div style="text-align:center;margin-bottom:12px;">
          <a href="${whatsappLink}" style="display:inline-block;width:100%;box-sizing:border-box;background:#25D366;color:#ffffff;padding:14px 20px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;box-shadow:0 4px 16px rgba(37,211,102,0.3);">
            💬 Connect Directly on WhatsApp
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#0f172a;padding:18px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05);">
        © 2026 SSSAM Academy • Old DLF, Sector 14, Gurugram, HR<br>
        Phone: +91 9217031899 | Website: <a href="https://www.sssamacademy.com" style="color:#e0a730;text-decoration:none;">www.sssamacademy.com</a>
      </div>
    </div>
  </body>
  </html>`;
}

// ===============================
// 🏢 HIRING REQUEST ADMIN TEMPLATE
// ===============================
function getHiringAdminEmailTemplate(data) {
  const callLink = `tel:${data.mobileNumber}`;
  const whatsappLink = `https://wa.me/91${data.mobileNumber}?text=Hello%20${encodeURIComponent(data.hrName)},%20regarding%20your%20hiring%20request%20for%20${encodeURIComponent(data.techDomain)}%20from%20SSSAM%20Academy.`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:560px;margin:30px auto;background:#111827;border:1px solid rgba(224,167,48,0.3);border-radius:18px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.5);">
      
      <!-- HEADER -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:28px 24px;text-align:center;border-bottom:2px solid #e0a730;">
        <div style="display:inline-block;background:rgba(224,167,48,0.15);border:1px solid #e0a730;border-radius:50%;width:54px;height:54px;line-height:54px;font-size:26px;color:#e0a730;margin-bottom:10px;">
          🏢
        </div>
        <h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">New Corporate Hiring Request</h2>
        <p style="margin:6px 0 0;color:#e0a730;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">SSSAM Academy • Placement Cell</p>
      </div>

      <!-- BODY CONTENT -->
      <div style="padding:28px 24px;">
        <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.6;">
          An employer has requested pre-assessed candidate profiles for hiring. Details below:
        </p>

        <!-- DETAILS CARD -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#cbd5e1;">
            <tr>
              <td style="padding:8px 0;color:#94a3b8;width:120px;font-weight:600;">Request ID:</td>
              <td style="padding:8px 0;color:#e0a730;font-family:monospace;font-weight:700;font-size:15px;">${data.requestId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Company Name:</td>
              <td style="padding:8px 0;color:#ffffff;font-weight:700;">${data.companyName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">HR Contact:</td>
              <td style="padding:8px 0;color:#ffffff;">${data.hrName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Mobile:</td>
              <td style="padding:8px 0;"><a href="${callLink}" style="color:#38bdf8;text-decoration:none;font-weight:600;">${data.mobileNumber}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Email:</td>
              <td style="padding:8px 0;"><a href="mailto:${data.email}" style="color:#cbd5e1;text-decoration:none;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Tech Domain:</td>
              <td style="padding:8px 0;color:#f8fafc;font-weight:700;">${data.techDomain}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#94a3b8;font-weight:600;">Date & Time:</td>
              <td style="padding:8px 0;color:#94a3b8;font-size:13px;">${data.date}</td>
            </tr>
          </table>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="display:flex;gap:12px;text-align:center;">
          <a href="${callLink}" style="flex:1;display:inline-block;background:linear-gradient(135deg, #e0a730 0%, #c99324 100%);color:#111827;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;box-shadow:0 4px 14px rgba(224,167,48,0.3);">
            📞 Call HR
          </a>
          <a href="${whatsappLink}" style="flex:1;display:inline-block;background:#25D366;color:#ffffff;padding:12px 18px;border-radius:10px;font-weight:700;text-decoration:none;font-size:14px;box-shadow:0 4px 14px rgba(37,211,102,0.3);">
            💬 Open WhatsApp
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#0f172a;padding:16px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05);">
        Admin Notification • SSSAM Academy Placement Cell
      </div>
    </div>
  </body>
  </html>`;
}

// ===============================
// 🏢 HIRING REQUEST CONFIRMATION TEMPLATE (for HR)
// ===============================
function getHiringConfirmationEmailTemplate(data) {
  const whatsappLink = `https://wa.me/919217031899?text=Hello%20SSSAM%20Academy,%20I%20want%20to%20follow%20up%20on%20my%20hiring%20request%20(ID:%20${data.requestId})`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:560px;margin:30px auto;background:#111827;border:1px solid rgba(224,167,48,0.3);border-radius:18px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.5);">
      
      <!-- HEADER -->
      <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:28px 24px;text-align:center;border-bottom:2px solid #e0a730;">
        <h1 style="margin:0 0 6px;color:#e0a730;font-size:24px;font-weight:900;letter-spacing:-0.5px;">SSSAM ACADEMY</h1>
        <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">Hiring Partner Request Received ✅</p>
      </div>

      <!-- BODY CONTENT -->
      <div style="padding:28px 24px;">
        <p style="margin:0 0 14px;color:#f8fafc;font-size:15px;line-height:1.6;">
          Dear <b>${data.hrName}</b>,
        </p>
        <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
          Thank you for choosing <b>SSSAM Academy</b> as your recruitment partner. We have received your hiring request for <b>${data.techDomain}</b> candidates for <b>${data.companyName}</b>.
        </p>

        <!-- SUMMARY CARD -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#cbd5e1;">
            <tr>
              <td style="padding:6px 0;color:#94a3b8;width:120px;font-weight:600;">Request ID:</td>
              <td style="padding:6px 0;color:#e0a730;font-family:monospace;font-weight:700;">${data.requestId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-weight:600;">Company:</td>
              <td style="padding:6px 0;color:#ffffff;font-weight:600;">${data.companyName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-weight:600;">Tech Domain:</td>
              <td style="padding:6px 0;color:#ffffff;font-weight:600;">${data.techDomain}</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;line-height:1.6;">
          Our placement cell manager will share pre-screened candidate resumes matching your requirements within 24 hours.
        </p>

        <!-- WHATSAPP CTA -->
        <div style="text-align:center;margin-bottom:12px;">
          <a href="${whatsappLink}" style="display:inline-block;width:100%;box-sizing:border-box;background:#25D366;color:#ffffff;padding:14px 20px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;box-shadow:0 4px 16px rgba(37,211,102,0.3);">
            💬 Connect Direct with Placement Coordinator
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#0f172a;padding:18px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.05);">
        © 2026 SSSAM Academy • Sector 14, Gurugram, Haryana<br>
        Direct Hotline: +91 9217031899 | Website: <a href="https://www.sssamacademy.com" style="color:#e0a730;text-decoration:none;">www.sssamacademy.com</a>
      </div>
    </div>
  </body>
  </html>`;
}

module.exports = {
  getStudentEmailTemplate,
  getAdminEmailTemplate,
  getSeminarAdminEmailTemplate,
  getSeminarConfirmationEmailTemplate,
  getHiringAdminEmailTemplate,
  getHiringConfirmationEmailTemplate,
};