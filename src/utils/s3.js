const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Initialize S3/R2 Client configuration
const clientConfig = {
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION || 'auto',
};

if (process.env.R2_ENDPOINT) {
  clientConfig.endpoint = process.env.R2_ENDPOINT;
}

const s3Client = new S3Client(clientConfig);

/**
 * Compresses raster images using sharp (resizes to max 1920px & converts to WebP with 80% quality).
 * If non-image or processing fails, returns the original buffer untouched.
 */
async function processImageBuffer(fileBuffer, originalName, mimeType) {
  const compressibleMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/tiff',
    'image/bmp',
  ];

  if (!mimeType || !compressibleMimeTypes.includes(mimeType.toLowerCase())) {
    return { buffer: fileBuffer, filename: originalName, mimeType };
  }

  try {
    const compressedBuffer = await sharp(fileBuffer)
      .rotate() // Auto-orient based on EXIF metadata
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const newFilename = `${nameWithoutExt}.webp`;

    return {
      buffer: compressedBuffer,
      filename: newFilename,
      mimeType: 'image/webp',
    };
  } catch (err) {
    console.warn(`[Image Compression] Could not compress ${originalName}, using original buffer:`, err.message);
    return { buffer: fileBuffer, filename: originalName, mimeType };
  }
}

/**
 * Uploads a file buffer to Cloudflare R2 or AWS S3 bucket, with fallback to local storage.
 * Automatically compresses images before upload.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} originalName - The original name of the file.
 * @param {string} mimeType - The mime type of the file.
 * @returns {Promise<string>} The public URL or relative local path of the uploaded file.
 */
async function uploadToS3(fileBuffer, originalName, mimeType) {
  // Automatically compress & convert images to WebP if applicable
  const processed = await processImageBuffer(fileBuffer, originalName, mimeType);
  const targetBuffer = processed.buffer;
  const targetName = processed.filename;
  const targetMime = processed.mimeType;

  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET || process.env.AWS_BUCKET_NAME;

  // Sanitize filename and append timestamp
  const cleanName = targetName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${cleanName}`;
  const fileKey = `uploads/${filename}`;

  if (accessKeyId && secretAccessKey && bucketName) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: targetBuffer,
        ContentType: targetMime,
      });

      await s3Client.send(command);
      
      // Return public URL (R2 CDN Dev Domain or AWS format)
      if (process.env.R2_PUBLIC_URL) {
        const baseCdn = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
        return `${baseCdn}/${fileKey}`;
      }
      return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
    } catch (s3Err) {
      console.warn('S3/R2 upload warning, falling back to local file storage:', s3Err.message);
    }
  }

  // Fallback to local storage in backend/uploads directory
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const localFilePath = path.join(uploadsDir, filename);
  fs.writeFileSync(localFilePath, targetBuffer);
  return `/uploads/${filename}`;
}

/**
 * Deletes a file from S3 bucket using its public URL or raw Key
 * @param {string} fileUrl - The public URL or key of the file to delete
 */
async function deleteFromS3(fileUrl) {
  if (!fileUrl) return;

  // If local file, delete from uploads directory
  if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('uploads/')) {
    const filename = path.basename(fileUrl);
    const localFilePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log(`Successfully deleted local file: ${filename}`);
      } catch (err) {
        console.error(`Failed to delete local file (${filename}):`, err.message);
      }
    }
    return;
  }

  const bucketName = process.env.R2_BUCKET || process.env.AWS_BUCKET_NAME;
  if (!bucketName) return;

  try {
    let fileKey = fileUrl;
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const urlObj = new URL(fileUrl);
      fileKey = decodeURIComponent(urlObj.pathname).replace(/^\/+/, '');
    }

    if (!fileKey) return;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted file from S3: ${fileKey}`);
  } catch (err) {
    console.error(`Failed to delete S3 file (${fileUrl}):`, err.message);
  }
}

module.exports = {
  uploadToS3,
  deleteFromS3,
};
