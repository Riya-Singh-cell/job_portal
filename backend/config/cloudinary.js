/**
 * @file config/cloudinary.js
 * @description Cloudinary configuration and multer storage setup for file uploads.
 * Falls back to local disk storage if Cloudinary credentials are not provided.
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary if credentials are available
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️  Cloudinary configured');
} else {
  console.log('⚠️  Cloudinary not configured — using local storage fallback');
}

// ─── Local Storage Fallback ───────────────────────────────────────────────────

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === 'resume' ? 'resumes' : 'images';
    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ─── File Filters ─────────────────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for resumes'), false);
  }
};

// ─── Upload Middleware Factories ──────────────────────────────────────────────

/**
 * Create multer upload middleware.
 * Uses Cloudinary if configured, otherwise falls back to local disk.
 */
const createUpload = (filter, limits = { fileSize: 5 * 1024 * 1024 }) => {
  if (isCloudinaryConfigured) {
    // Dynamically require multer-storage-cloudinary
    try {
      const { CloudinaryStorage } = require('multer-storage-cloudinary');
      const storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
          folder: 'job-portal',
          resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
          allowed_formats: file.mimetype === 'application/pdf' ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
        }),
      });
      return multer({ storage, fileFilter: filter, limits });
    } catch {
      // Fall through to local storage
    }
  }
  return multer({ storage: localStorage, fileFilter: filter, limits });
};

/**
 * Upload avatar/logo image (max 2MB).
 */
const uploadImage = createUpload(imageFilter, { fileSize: 2 * 1024 * 1024 });

/**
 * Upload resume PDF (max 5MB).
 */
const uploadResume = createUpload(resumeFilter, { fileSize: 5 * 1024 * 1024 });

// ─── Cloudinary Helpers ───────────────────────────────────────────────────────

/**
 * Upload a buffer/path to Cloudinary and return the secure URL.
 * @param {string} filePath - Local file path or base64 data URI
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - 'image' or 'raw'
 * @returns {Promise<string>} Secure URL of the uploaded file
 */
const uploadToCloudinary = async (filePath, folder = 'job-portal', resourceType = 'image') => {
  if (!isCloudinaryConfigured) {
    return filePath; // Return as-is for local storage
  }
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });
  return result.secure_url;
};

/**
 * Delete a file from Cloudinary by its public ID.
 * @param {string} publicId - Cloudinary public ID of the file to delete
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary asset: ${err.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadResume,
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};
