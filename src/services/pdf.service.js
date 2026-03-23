const fs = require('fs/promises');
const path = require('path');
const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');

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

const wrapLines = (text, font, size, maxWidth) => {
  const words = safe(text).split(' ');
  let lines = [];
  let line = '';

  for (let word of words) {
    let test = line ? line + ' ' + word : word;
    let width = font.widthOfTextAtSize(test, size);

    if (width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
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

const generateCertificatePDF = async (record) => {
  if (!record) throw new Error('Record data missing');

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const W = page.getWidth();
  const H = page.getHeight();

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const certifyFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const nameFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const courseRegularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const courseBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const dark = rgb(0.05, 0.08, 0.18);
  const gold = rgb(0.78, 0.62, 0.18);
  const lightGold = rgb(0.95, 0.85, 0.4);
  const cream = rgb(0.98, 0.97, 0.94);
  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);

  // BACKGROUND
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: dark });

  page.drawRectangle({
    x: 60,
    y: 60,
    width: W - 120,
    height: H - 120,
    color: cream
  });

  // BORDER
  page.drawRectangle({
    x: 15,
    y: 15,
    width: W - 30,
    height: H - 30,
    borderColor: gold,
    borderWidth: 4
  });

  page.drawRectangle({
    x: 25,
    y: 25,
    width: W - 50,
    height: H - 50,
    borderColor: lightGold,
    borderWidth: 1.5
  });

  // LOGO (BIG + CENTERED)
  let logoImg = null;
  try {
    const logoBuffer = await fs.readFile(LOGO_PATH);

    if (LOGO_PATH.toLowerCase().endsWith('.png')) {
      logoImg = await pdfDoc.embedPng(logoBuffer);
    } else {
      logoImg = await pdfDoc.embedJpg(logoBuffer);
    }
  } catch {}

  if (logoImg) {
    const dims = logoImg.scaleToFit(180, 180);
    page.drawImage(logoImg, {
      x: (W - dims.width) / 2,
      y: H - 150,
      width: dims.width,
      height: dims.height
    });
  }

  // TITLE
  const title = 'CERTIFICATE OF COMPLETION';

  page.drawText(title, {
    x: cx(title, titleFont, 36, W),
    y: H - 220,
    size: 36,
    font: titleFont,
    color: dark
  });

  page.drawLine({
    start: { x: 200, y: H - 230 },
    end: { x: W - 200, y: H - 230 },
    thickness: 2,
    color: gold
  });

  // WATERMARK
  const watermarkText = 'SSSAM ACADEMY';
  const watermarkSize = 60;
  page.drawText(watermarkText, {
    x: cx(watermarkText, bold, watermarkSize, W),
    y: H / 2 - watermarkSize / 2,
    size: 60,
    font: bold,
    color: rgb(0.85, 0.85, 0.85),
    opacity: 0.15,
    rotate: degrees(25) 
  });

  // CONTENT
  let curY = H - 270;

  const line1 = 'This is to certify that';
  page.drawText(line1, {
    x: cx(line1, certifyFont, 20, W),
    y: curY,
    size: 20,
    font: certifyFont,
    color: black
  });

  curY -= 50;

  // NAME
  const name = safe(record.fullName);
  const nameWidth = nameFont.widthOfTextAtSize(name, 32);



  page.drawText(name, {
    x: cx(name, nameFont, 32, W),
    y: curY,
    size: 32,
    font: nameFont,
    color: black
  });

  curY -= 45;

  const courseParts = [
    { text: 'has successfully completed the ', bold: false },
    { text: `${safe(record.duration)} `, bold: true },
    { text: `${safe(record.course)} `, bold: true },
    { text: `${safe(record.certificateType)} at `, bold: false },
    { text: 'SSSAM Academy', bold: true },
    {
      text: ', demonstrating proficiency, practical skills, and a strong understanding of industry-relevant concepts in ',
      bold: false
    },
    { text: safe(record.course), bold: true },
    { text: '.', bold: false }
  ];

  curY = drawRichCenteredParagraph({
    page,
    parts: courseParts,
    startY: curY,
    size: 16,
    lineGap: 22,
    maxWidth: W - 200,
    regularFont: courseRegularFont,
    boldFont: courseBoldFont,
    color: black,
    pageWidth: W
  });

  // CERT NUMBER (FIXED FORMAT AS REQUESTED)
  const topRightInset = 70;
  const certNoText = `Cert No: ${safe(record.certificateNumber)}`;
  page.drawText(certNoText, {
    x: W - bold.widthOfTextAtSize(certNoText, 10) - topRightInset,
    y: H - 80,
    size: 10,
    font: bold,
    color: black
  });

  const dateText = `Date: ${formatDate(record.issueDate)}`;
  page.drawText(dateText, {
    x: W - bold.widthOfTextAtSize(dateText, 10) - topRightInset,
    y: H - 96,
    size: 10,
    font: bold,
    color: black
  });

  // SIGNATURE
  const sigY = 112;
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
    const dims = mohitSignImg.scaleToFit(120, 70);
    page.drawImage(mohitSignImg, {
      x: leftLineStart + (leftLineEnd - leftLineStart - dims.width) / 2,
      y: sigY + 6,
      width: dims.width,
      height: dims.height
    });
  }

  if (satishSignImg) {
    const dims = satishSignImg.scaleToFit(120, 70);
    page.drawImage(satishSignImg, {
      x: rightLineStart + (rightLineEnd - rightLineStart - dims.width) / 2,
      y: sigY + 6,
      width: dims.width,
      height: dims.height
    });
  }

  page.drawLine({
    start: { x: leftLineStart, y: sigY },
    end: { x: leftLineEnd, y: sigY },
    thickness: 1.5,
    color: gold
  });

  page.drawText('INSTRUCTOR / TRAINER', {
    x: 120,
    y: sigY - 15,
    size: 10,
    font: bold,
    color: black
  });

  page.drawLine({
    start: { x: rightLineStart, y: sigY },
    end: { x: rightLineEnd, y: sigY },
    thickness: 1.5,
    color: gold
  });

  page.drawText('Director / Head', {
    x: W - 250,
    y: sigY - 15,
    size: 10,
    font: bold,
    color: black
  });

  // FOOTER (FULL ADDRESS + CONTACT — CLEAR & CENTERED)
  const f1 = 'Smart Solutions School of Al & Machine Learning';
  const f2 =
    'M24 Ground Floor, Old DLF, Sector 14, Gurugram, Haryana Contact: 9217031899 | Email: sssamacademy@gmail.com | Website: sssamacademy.com';
 

  page.drawText(f1, {
    x: cx(f1, bold, 12, W),
    y: 46,
    size: 12,
    font: bold,
    color: white
  });

  page.drawText(f2, {
    x: cx(f2, regular, 10, W),
    y: 31,
    size: 10,
    font: regular,
    color: white
  });

 

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

module.exports = {
  generateCertificatePDF,
  generateCertificatePdf: generateCertificatePDF
};