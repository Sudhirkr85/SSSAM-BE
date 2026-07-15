const fs = require('fs/promises');
const path = require('path');
const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const QRCode = require('qrcode');

const LOGO_PATH =
  process.env.LOGO_PATH || path.resolve(__dirname, './sssam_logo.png');
const MOHIT_SIGN_PATH =
  process.env.MOHIT_SIGN_PATH || path.resolve(__dirname, './mohit_sign.png');
const SATISH_SIGN_PATH =
  process.env.SATISH_SIGN_PATH || path.resolve(__dirname, './satish_sign.png');

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });

const safe = (value) => String(value || '').trim();

const cx = (text, font, size, pageWidth) => {
  const w = font.widthOfTextAtSize(text, size);
  return (pageWidth - w) / 2;
};

const drawRichCenteredParagraph = ({
  page,
  parts,
  startY,
  size,
  lineGap,
  maxWidth,
  regularFont,
  boldFont,
  color,
  pageWidth
}) => {
  const tokens = [];

  for (const part of parts) {
    const chunks = String(part.text || '').match(/\S+\s*/g) || [];
    for (const chunk of chunks) {
      tokens.push({ text: chunk, bold: !!part.bold });
    }
  }

  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  for (const token of tokens) {
    const font = token.bold ? boldFont : regularFont;
    const tokenWidth = font.widthOfTextAtSize(token.text, size);

    if (currentLine.length && currentWidth + tokenWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = [token];
      currentWidth = tokenWidth;
    } else {
      currentLine.push(token);
      currentWidth += tokenWidth;
    }
  }

  if (currentLine.length) lines.push(currentLine);

  let y = startY;
  for (const line of lines) {
    const lineWidth = line.reduce((sum, token) => {
      const font = token.bold ? boldFont : regularFont;
      return sum + font.widthOfTextAtSize(token.text, size);
    }, 0);

    let x = (pageWidth - lineWidth) / 2;
    for (const token of line) {
      const font = token.bold ? boldFont : regularFont;
      page.drawText(token.text, {
        x,
        y,
        size,
        font,
        color
      });
      x += font.widthOfTextAtSize(token.text, size);
    }

    y -= lineGap;
  }

  return y;
};

// Map training types to template options
const getTemplateOptions = (type) => {
  const t = String(type || '').trim().toLowerCase();
  switch (t) {
    case 'workshop':
      return {
        title: 'CERTIFICATE OF PARTICIPATION',
        primaryColor: rgb(0.06, 0.45, 0.45), // Teal
        secondaryColor: rgb(0.1, 0.6, 0.6)
      };
    case 'industrial training':
      return {
        title: 'CERTIFICATE OF INDUSTRIAL TRAINING',
        primaryColor: rgb(0.12, 0.35, 0.55), // Steel-blue
        secondaryColor: rgb(0.2, 0.5, 0.7)
      };
    case 'internship':
      return {
        title: 'CERTIFICATE OF INTERNSHIP',
        primaryColor: rgb(0.44, 0.16, 0.59), // Purple
        secondaryColor: rgb(0.6, 0.3, 0.8)
      };
    case 'academic training':
      return {
        title: 'CERTIFICATE OF ACADEMIC TRAINING',
        primaryColor: rgb(0.08, 0.18, 0.36), // Navy
        secondaryColor: rgb(0.15, 0.3, 0.55)
      };
    case 'corporate training':
      return {
        title: 'CERTIFICATE OF CORPORATE TRAINING',
        primaryColor: rgb(0.2, 0.2, 0.2), // Charcoal
        secondaryColor: rgb(0.78, 0.62, 0.18) // Charcoal gold
      };
    default:
      return {
        title: 'CERTIFICATE OF COMPLETION',
        primaryColor: rgb(0.78, 0.62, 0.18), // Gold (existing)
        secondaryColor: rgb(0.95, 0.85, 0.4)
      };
  }
};

const generateCertificatePDF = async (record) => {
  if (!record) throw new Error('Record data missing');

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const W = page.getWidth();
  const H = page.getHeight();

  pdfDoc.registerFontkit(fontkit);

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const certifyFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  // Embed GreatVibes cursive font instead of standard TimesRomanBoldItalic
  const fontBuffer = await fs.readFile(path.resolve(__dirname, '../assets/fonts/GreatVibes-Regular.ttf'));
  const nameFont = await pdfDoc.embedFont(fontBuffer);

  const courseRegularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const courseBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const dark = rgb(15/255, 31/255, 61/255);       // Deep Navy (#0F1F3D)
  const primaryColor = rgb(201/255, 162/255, 39/255); // Gold (#C9A227)
  const cream = rgb(0.98, 0.97, 0.94);
  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);

  // Template Options (Loads certificate title dynamically)
  const { title } = getTemplateOptions(record.certificateType);

  // 1. Thin outer gold border (simulated by drawing gold background first)
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: primaryColor });

  // 2. Thick deep navy band (leaves 4px outer gold border)
  const navyPadding = 4;
  page.drawRectangle({
    x: navyPadding,
    y: navyPadding,
    width: W - (navyPadding * 2),
    height: H - (navyPadding * 2),
    color: dark
  });

  // 3. Two thin concentric gold rectangles inside the navy band
  // Outer concentric gold line (offset 12px from edge)
  page.drawRectangle({
    x: 12,
    y: 12,
    width: W - 24,
    height: H - 24,
    borderColor: primaryColor,
    borderWidth: 1.2
  });

  // Inner concentric gold line (offset 18px from edge)
  page.drawRectangle({
    x: 18,
    y: 18,
    width: W - 36,
    height: H - 36,
    borderColor: primaryColor,
    borderWidth: 1.2
  });

  // 4. White content card (leaves 35px navy margin from edge)
  const cardOffset = 35;
  page.drawRectangle({
    x: cardOffset,
    y: cardOffset,
    width: W - (cardOffset * 2),
    height: H - (cardOffset * 2),
    color: white
  });

  // 5. Thin gold border framing the white card (offset 35px from edge)
  page.drawRectangle({
    x: cardOffset,
    y: cardOffset,
    width: W - (cardOffset * 2),
    height: H - (cardOffset * 2),
    borderColor: primaryColor,
    borderWidth: 1.2
  });

  // Card boundary definitions for layout consistency
  const xLeft = cardOffset;
  const xRight = W - cardOffset;
  const yBottom = cardOffset;
  const yTop = H - cardOffset;
  const midY = H / 2;

  // SOLID NAVY FOOTER BAR (#0F1F3D) - SPANNING INNER WIDTH WITH MARGINS TO PREVENT CORNER COLLISION
  page.drawRectangle({
    x: 35,
    y: 30,
    width: W - 70,
    height: 50,
    color: dark
  });

  // Dynamic Footer with gold SVGs and aligned text matching target image exactly
  const pinSvg = "M 0,-10 C -3,-10 -5,-8 -5,-5 C -5,-1 -1.5,3 0,4.5 C 1.5,3 5,-1 5,-5 C 5,-8 3,-10 0,-10 Z M 0,-6.5 A 1.5,1.5 0 1,1 0,-3.5 A 1.5,1.5 0 1,1 0,-6.5 Z";
  const phoneSvg = "M -3.5,-5 C -4.5,-5 -5,-4.5 -5,-3.5 C -5,-2 -3.5,0.5 -1.5,2.5 C 0.5,4.5 2,5 3.5,5 C 4.5,5 5,4.5 5,3.5 C 5,2.5 4,2 3.5,1.5 C 3,1 2,1.5 1.5,1 C 1,0.5 0.5,0 0,-0.5 C -0.5,-1 -0.5,-1.5 -1,-2 C -1.5,-2.5 -1,-3 -0.5,-3.5 C 0,-4 -0.5,-5 -1.5,-5 Z";
  const envelopeSvg = "M -6,-4.5 H 6 V 4.5 H -6 Z M -6,-3 L 0,1 L 6,-3 M -6,3 L -2,0 M 6,3 L 2,0";
  const globeSvg = "M 0,-5 A 5,5 0 1,0 0,5 A 5,5 0 1,0 0,-5 M -5,0 H 5 M 0,-5 A 2,5 0 0,0 0,5 A 2,5 0 0,0 0,-5";

  const fAddress = 'M24 Ground Floor, Old DLF, Sector 14, Gurugram, Haryana 122001';
  const fPhone = '9217031899';
  const fEmail = 'info@sssamacademy.com';
  const fWebsite = 'www.sssamacademy.com';
  const fSep = '  |  ';

  const wAddress = regular.widthOfTextAtSize(fAddress, 9.2);
  const wPhone = regular.widthOfTextAtSize(fPhone, 9.2);
  const wEmail = regular.widthOfTextAtSize(fEmail, 9.2);
  const wWebsite = regular.widthOfTextAtSize(fWebsite, 9.2);
  const wSep = regular.widthOfTextAtSize(fSep, 9.2);

  const iconW = 10;
  const iconGap = 4;

  const totalFooterW = 
    (iconW + iconGap + wAddress) + wSep +
    (iconW + iconGap + wPhone) + wSep +
    (iconW + iconGap + wEmail) + wSep +
    (iconW + iconGap + wWebsite);

  let curFX = (W - totalFooterW) / 2;
  const footerY = 40; // Position contact details on the lower line

  // Address
  page.drawSvgPath(pinSvg, { x: curFX + 5, y: footerY + 5, color: primaryColor, scale: 0.9 });
  curFX += iconW + iconGap;
  page.drawText(fAddress, { x: curFX, y: footerY, size: 9.2, font: regular, color: white });
  curFX += wAddress;

  // Separator
  page.drawText(fSep, { x: curFX, y: footerY, size: 9.2, font: regular, color: primaryColor });
  curFX += wSep;

  // Phone
  page.drawSvgPath(phoneSvg, { x: curFX + 5, y: footerY + 5, color: primaryColor, scale: 0.9 });
  curFX += iconW + iconGap;
  page.drawText(fPhone, { x: curFX, y: footerY, size: 9.2, font: regular, color: white });
  curFX += wPhone;

  // Separator
  page.drawText(fSep, { x: curFX, y: footerY, size: 9.2, font: regular, color: primaryColor });
  curFX += wSep;

  // Email
  page.drawSvgPath(envelopeSvg, { x: curFX + 5, y: footerY + 5, color: primaryColor, scale: 0.9 });
  curFX += iconW + iconGap;
  page.drawText(fEmail, { x: curFX, y: footerY, size: 9.2, font: regular, color: white });
  curFX += wEmail;

  // Separator
  page.drawText(fSep, { x: curFX, y: footerY, size: 9.2, font: regular, color: primaryColor });
  curFX += wSep;

  // Website
  page.drawSvgPath(globeSvg, { x: curFX + 5, y: footerY + 5, color: primaryColor, scale: 0.9 });
  curFX += iconW + iconGap;
  page.drawText(fWebsite, { x: curFX, y: footerY, size: 9.2, font: regular, color: white });

  // Draw full form of SSSAM on the upper line inside the navy bar
  const fFullForm = "SMART SOLUTIONS SCHOOL OF AI & MACHINE LEARNING";
  const wFullForm = bold.widthOfTextAtSize(fFullForm, 8.5);
  page.drawText(fFullForm, {
    x: (W - wFullForm) / 2,
    y: 62,
    size: 8.5,
    font: bold,
    color: primaryColor
  });

  // LOGO & "SSSAM ACADEMY" BRANDING (TOP-LEFT STACKED: Correct wide aspect ratio, no squishing)
  let logoImg = null;
  try {
    const logoBuffer = await fs.readFile(LOGO_PATH);
    logoImg = LOGO_PATH.toLowerCase().endsWith('.png')
      ? await pdfDoc.embedPng(logoBuffer)
      : await pdfDoc.embedJpg(logoBuffer);
  } catch {}

  if (logoImg) {
    // Aspect ratio of sssam_logo.png is approx 3.37:1
    page.drawImage(logoImg, {
      x: 48,
      y: H - 85,
      width: 135,
      height: 40
    });
  }

  // CERT NUMBER & ISSUE DATE (TOP-RIGHT ALIGNED, SPLIT COLORS TO MATCH TARGET IMAGE)
  const rightX = W - 45;
  const label1 = "Cert No.: ";
  const val1 = safe(record.certificateNumber);
  const wVal1 = bold.widthOfTextAtSize(val1, 10);
  const wLabel1 = bold.widthOfTextAtSize(label1, 10);
  
  // Draw Cert No label in bold dark navy
  page.drawText(label1, {
    x: rightX - wVal1 - wLabel1,
    y: H - 70,
    size: 10,
    font: bold,
    color: dark
  });
  // Draw Cert No value in gold
  page.drawText(val1, {
    x: rightX - wVal1,
    y: H - 70,
    size: 10,
    font: bold,
    color: primaryColor
  });

  const label2 = "Issue Date: ";
  const val2 = formatDate(record.issueDate);
  const wVal2 = regular.widthOfTextAtSize(val2, 10);
  const wLabel2 = bold.widthOfTextAtSize(label2, 10);

  // Draw Date label in bold dark navy
  page.drawText(label2, {
    x: rightX - wVal2 - wLabel2,
    y: H - 85,
    size: 10,
    font: bold,
    color: dark
  });
  // Draw Date value in regular black
  page.drawText(val2, {
    x: rightX - wVal2,
    y: H - 85,
    size: 10,
    font: regular,
    color: black
  });

  // WATERMARK (Faint horizontal logo watermark drawn in the center of the certificate)
  if (logoImg) {
    const wWidth = 337;
    const wHeight = 100; // maintaining the aspect ratio of sssam_logo.png
    page.drawImage(logoImg, {
      x: (W - wWidth) / 2,
      y: (H - wHeight) / 2 + 10,
      width: wWidth,
      height: wHeight,
      opacity: 0.012
    });
  }

  // MAIN TITLE
  let curY = H - 142;
  page.drawText(title, {
    x: cx(title, titleFont, 28, W),
    y: curY,
    size: 28,
    font: titleFont,
    color: dark
  });

  // Gold Divider Line under Title with Center Gold Diamond Decorator
  curY -= 12;
  page.drawLine({
    start: { x: W / 2 - 130, y: curY },
    end: { x: W / 2 - 18, y: curY },
    thickness: 1.2,
    color: primaryColor
  });
  page.drawLine({
    start: { x: W / 2 + 18, y: curY },
    end: { x: W / 2 + 130, y: curY },
    thickness: 1.2,
    color: primaryColor
  });
  
  // Center diamond
  page.drawRectangle({
    x: W / 2,
    y: curY,
    width: 6,
    height: 6,
    color: primaryColor,
    rotate: degrees(45)
  });
  // Side small diamonds
  page.drawRectangle({
    x: W / 2 - 10,
    y: curY,
    width: 4,
    height: 4,
    color: primaryColor,
    rotate: degrees(45)
  });
  page.drawRectangle({
    x: W / 2 + 10,
    y: curY,
    width: 4,
    height: 4,
    color: primaryColor,
    rotate: degrees(45)
  });

  // INTRO STATEMENT
  curY -= 26;
  const line1 = 'This certificate is proudly presented to';
  page.drawText(line1, {
    x: cx(line1, certifyFont, 16, W),
    y: curY,
    size: 16,
    font: certifyFont,
    color: black
  });

  // STUDENT NAME (Cursive/Script Equivalent, Large size, Navy color, Gold underline)
  curY -= 48;
  const name = safe(record.fullName);
  page.drawText(name, {
    x: cx(name, nameFont, 46, W), // Sized to 46 for cursive font visibility
    y: curY,
    size: 46,
    font: nameFont,
    color: dark
  });

  // Thin dark navy underline below name (with 3 navy diamonds center)
  page.drawLine({
    start: { x: W / 2 - 130, y: curY - 12 },
    end: { x: W / 2 - 18, y: curY - 12 },
    thickness: 1.2,
    color: dark
  });
  page.drawLine({
    start: { x: W / 2 + 18, y: curY - 12 },
    end: { x: W / 2 + 130, y: curY - 12 },
    thickness: 1.2,
    color: dark
  });
  // Center diamond
  page.drawRectangle({
    x: W / 2,
    y: curY - 12,
    width: 6,
    height: 6,
    color: dark,
    rotate: degrees(45)
  });
  // Side small diamonds
  page.drawRectangle({
    x: W / 2 - 10,
    y: curY - 12,
    width: 4,
    height: 4,
    color: dark,
    rotate: degrees(45)
  });
  page.drawRectangle({
    x: W / 2 + 10,
    y: curY - 12,
    width: 4,
    height: 4,
    color: dark,
    rotate: degrees(45)
  });

  curY -= 32;

  // PARSING LOGIC FOR DYNAMIC FIELDS
  let cleanCourse = safe(record.course).toUpperCase();
  let orgName = "";
  
  const firstParenOpen = record.course.indexOf('(');
  if (firstParenOpen > -1) {
    let rawOrg = record.course.substring(firstParenOpen + 1);
    if (rawOrg.endsWith(')')) {
      rawOrg = rawOrg.slice(0, -1);
    }
    orgName = rawOrg.trim();
    
    // If it has nested abbreviation e.g. "IITM (Institute of...)" -> extract full form only
    const nestedParenOpen = orgName.indexOf('(');
    if (nestedParenOpen > -1) {
      let innerOrg = orgName.substring(nestedParenOpen + 1);
      if (innerOrg.endsWith(')')) {
        innerOrg = innerOrg.slice(0, -1);
      }
      orgName = innerOrg.trim();
    }
    
    cleanCourse = record.course.substring(0, firstParenOpen).trim().toUpperCase();
  }

  let cleanDuration = safe(record.duration);
  let dateRangeText = "";
  if (record.duration.includes(" | Duration: ")) {
    const parts = record.duration.split(" | Duration: ");
    cleanDuration = parts[0].trim();
    dateRangeText = parts[1].trim();
  }

  // Format e.g. "100 Hours" to "100-Hour", "4 Days" to "4-Day", "3 Months" to "3-Month"
  let displayDuration = cleanDuration
    .replace(/ hours/i, "-Hour")
    .replace(/ days/i, "-Day")
    .replace(/ months/i, "-Month")
    .replace(/ hour/i, "-Hour")
    .replace(/ day/i, "-Day")
    .replace(/ month/i, "-Month");

  // Generate certificate wording based on organization presence
  const courseParts = [];
  let wishText = "We wish you all success in your future endeavours.";

  if (orgName) {
    courseParts.push({ text: `a student of `, bold: false });
    courseParts.push({ text: `${safe(record.qualification || 'BCA/MCA')} `, bold: true });
    courseParts.push({ text: `from `, bold: false });
    courseParts.push({ text: `${orgName} `, bold: true });
    courseParts.push({ text: `for successfully completing the `, bold: false });
    courseParts.push({ text: `${displayDuration} `, bold: true });
    courseParts.push({ text: `Training Program on`, bold: false });

    wishText = "conducted by SSSAM Academy.";
  } else {
    const certType = safe(record.certificateType).toLowerCase();
    if (certType.includes("internship")) {
      // 2. Internship
      courseParts.push({ text: `for successfully completing the `, bold: false });
      courseParts.push({ text: `${displayDuration} `, bold: true });
      courseParts.push({ text: `Professional Internship in `, bold: false });

      wishText = "at SSSAM Academy, during which the candidate actively worked on live project assignments and demonstrated practical application of core industry tools and technologies.";
    } else if (certType.includes("workshop")) {
      // 3. Workshop
      courseParts.push({ text: `for successfully completing the intensive `, bold: false });
      courseParts.push({ text: `${displayDuration} `, bold: true });
      courseParts.push({ text: `Technical Workshop on `, bold: false });

      wishText = "at SSSAM Academy, demonstrating active participation and hands-on understanding of the subject.";
    } else {
      // 1. Regular Training
      courseParts.push({ text: `for successfully completing the `, bold: false });
      courseParts.push({ text: `${displayDuration} `, bold: true });
      courseParts.push({ text: `Training Program in `, bold: false });

      wishText = "at SSSAM Academy, having met all the prescribed academic and practical requirements of the industry-relevant curriculum.";
    }
  }

  // Draw intro paragraph using 14 size for elegant margins
  curY = drawRichCenteredParagraph({
    page,
    parts: courseParts,
    startY: curY,
    size: 14,
    lineGap: 20,
    maxWidth: 450,
    regularFont: courseRegularFont,
    boldFont: courseBoldFont,
    color: black,
    pageWidth: W
  });

  // COURSE NAME - Centered on its own line in big bold letters (matches target image!)
  curY -= 28;
  page.drawText(cleanCourse, {
    x: cx(cleanCourse, titleFont, 22, W),
    y: curY,
    size: 22,
    font: titleFont,
    color: dark
  });

  // DRAW SECOND PORTION OF THE WORDING (wishText)
  curY -= 20;
  curY = drawRichCenteredParagraph({
    page,
    parts: [{ text: wishText, bold: false }],
    startY: curY,
    size: 11,
    lineGap: 18,
    maxWidth: 620,
    regularFont: courseRegularFont,
    boldFont: courseBoldFont,
    color: black,
    pageWidth: W
  });

  const sigY = 110; // Setup sigY

  // DRAW DURATION RANGE ABOVE SIGNATURES (neatly centered and spaced)
  if (dateRangeText) {
    const durationLabelText = `Duration: ${dateRangeText}`;
    page.drawText(durationLabelText, {
      x: cx(durationLabelText, bold, 11, W),
      y: sigY + 38,
      size: 11,
      font: bold,
      color: black
    });
  }

  // Center gold decorative ornament above footer
  page.drawLine({
    start: { x: W / 2 - 40, y: sigY + 13 },
    end: { x: W / 2 - 12, y: sigY + 13 },
    thickness: 1.2,
    color: primaryColor
  });
  page.drawLine({
    start: { x: W / 2 + 12, y: sigY + 13 },
    end: { x: W / 2 + 40, y: sigY + 13 },
    thickness: 1.2,
    color: primaryColor
  });
  // Center diamond
  page.drawRectangle({
    x: W / 2,
    y: sigY + 13,
    width: 5,
    height: 5,
    color: primaryColor,
    rotate: degrees(45)
  });

  // QR CODE CONTAINER & EMBEDDING (White padded box with gold border to avoid Director signature collision)
  try {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/certificate.html?cert=${encodeURIComponent(record.certificateNumber)}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 140 });
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    // Draw white background container box for QR Code with thin gold border
    page.drawRectangle({
      x: W - 115,
      y: sigY,
      width: 76,
      height: 76,
      color: white,
      borderColor: primaryColor,
      borderWidth: 1
    });

    // Embed QR code inside the box with 4px padding
    page.drawImage(qrImage, {
      x: W - 111,
      y: sigY + 4,
      width: 68,
      height: 68
    });
  } catch (err) {
    console.error('Failed to embed QR code:', err);
  }

  // SIGNATURES POSITIONING
  const leftLineStart = 120;
  const leftLineEnd = 280;
  const rightLineStart = W - 280;
  const rightLineEnd = W - 120;

  // Signature images (optional)
  let mohitSignImg = null;
  let satishSignImg = null;

  try {
    const signBuffer = await fs.readFile(MOHIT_SIGN_PATH);
    mohitSignImg = MOHIT_SIGN_PATH.toLowerCase().endsWith('.png')
      ? await pdfDoc.embedPng(signBuffer)
      : await pdfDoc.embedJpg(signBuffer);
  } catch {}

  try {
    const signBuffer = await fs.readFile(SATISH_SIGN_PATH);
    satishSignImg = SATISH_SIGN_PATH.toLowerCase().endsWith('.png')
      ? await pdfDoc.embedPng(signBuffer)
      : await pdfDoc.embedJpg(signBuffer);
  } catch {}

  if (mohitSignImg) {
    const dims = mohitSignImg.scaleToFit(100, 60);
    page.drawImage(mohitSignImg, {
      x: leftLineStart + (leftLineEnd - leftLineStart - dims.width) / 2,
      y: sigY + 10,
      width: dims.width,
      height: dims.height
    });
  }

  if (satishSignImg) {
    const dims = satishSignImg.scaleToFit(100, 60);
    page.drawImage(satishSignImg, {
      x: rightLineStart + (rightLineEnd - rightLineStart - dims.width) / 2,
      y: sigY + 10,
      width: dims.width,
      height: dims.height
    });
  }

  // Instructor/Trainer Signature Line
  page.drawLine({
    start: { x: leftLineStart, y: sigY },
    end: { x: leftLineEnd, y: sigY },
    thickness: 1.5,
    color: primaryColor
  });
  page.drawText('INSTRUCTOR / TRAINER', {
    x: leftLineStart + (leftLineEnd - leftLineStart - bold.widthOfTextAtSize('INSTRUCTOR / TRAINER', 10)) / 2,
    y: sigY - 14,
    size: 10,
    font: bold,
    color: dark
  });

  // Director/Head Signature Line
  page.drawLine({
    start: { x: rightLineStart, y: sigY },
    end: { x: rightLineEnd, y: sigY },
    thickness: 1.5,
    color: primaryColor
  });
  page.drawText('Director / Head', {
    x: rightLineStart + (rightLineEnd - rightLineStart - bold.widthOfTextAtSize('Director / Head', 10)) / 2,
    y: sigY - 14,
    size: 10,
    font: bold,
    color: dark
  });

  // Bottom footer bar is now drawn at the top for correct layering z-index

  // Small golden dot separators between footer text segments (simulated with diamonds)
  // Draw little golden icons before details using simple bullet stars
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

module.exports = {
  generateCertificatePDF,
  generateCertificatePdf: generateCertificatePDF
};