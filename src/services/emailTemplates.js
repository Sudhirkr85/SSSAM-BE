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
          <p><b>Enquiry Type:</b> Demo Class Request</p>
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
module.exports = {
  getStudentEmailTemplate,
  getAdminEmailTemplate
};