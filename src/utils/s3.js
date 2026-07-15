const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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
 * Uploads a file buffer to Cloudflare R2 or AWS S3 bucket.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} originalName - The original name of the file.
 * @param {string} mimeType - The mime type of the file.
 * @returns {Promise<string>} The public URL of the uploaded file on S3.
 */
async function uploadToS3(fileBuffer, originalName, mimeType) {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET || process.env.AWS_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('Storage credentials or bucket name are missing in environment variables.');
  }

  // Sanitize filename and append timestamp
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileKey = `uploads/${Date.now()}-${cleanName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
  
  // Return public URL (R2 CDN Dev Domain or AWS format)
  if (process.env.R2_PUBLIC_URL) {
    const baseCdn = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
    return `${baseCdn}/${fileKey}`;
  }
  return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
}

module.exports = {
  uploadToS3,
};
