const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Initialize AWS S3 Client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION || 'us-east-1',
});

/**
 * Uploads a file buffer to AWS S3 bucket.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} originalName - The original name of the file.
 * @param {string} mimeType - The mime type of the file.
 * @returns {Promise<string>} The public URL of the uploaded file on S3.
 */
async function uploadToS3(fileBuffer, originalName, mimeType) {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('AWS S3 credentials or bucket name are missing in environment variables.');
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
  
  // Return public URL
  return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
}

module.exports = {
  uploadToS3,
};
