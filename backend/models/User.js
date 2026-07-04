const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @module models/User
 * @description Mongoose model for application users (candidates, recruiters, admins).
 * Handles password hashing, role management, profile data, and account verification.
 */

// ─── Sub-Schemas ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Education
 * @property {string} school - Name of the educational institution
 * @property {string} degree - Degree obtained (e.g., B.Sc., M.Sc.)
 * @property {string} fieldOfStudy - Area of study or major
 * @property {Date} from - Start date
 * @property {Date} to - End date (null if current)
 * @property {boolean} current - Whether currently enrolled
 * @property {string} description - Additional details about the education
 */
const educationSchema = new mongoose.Schema(
  {
    school: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    from: { type: Date },
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: true }
);

/**
 * @typedef {Object} Experience
 * @property {string} title - Job title held
 * @property {string} company - Company name
 * @property {string} location - Work location
 * @property {Date} from - Start date
 * @property {Date} to - End date (null if current)
 * @property {boolean} current - Whether currently employed here
 * @property {string} description - Role description and responsibilities
 */
const experienceSchema = new mongoose.Schema(
  {
    title: { type: String },
    company: { type: String },
    location: { type: String },
    from: { type: Date },
    to: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: true }
);

/**
 * @typedef {Object} Certification
 * @property {string} name - Certification name
 * @property {string} issuer - Issuing organization
 * @property {Date} issueDate - Date of issuance
 * @property {Date} expirationDate - Expiration date (if applicable)
 * @property {string} credentialId - Unique credential identifier
 */
const certificationSchema = new mongoose.Schema(
  {
    name: { type: String },
    issuer: { type: String },
    issueDate: { type: Date },
    expirationDate: { type: Date },
    credentialId: { type: String },
  },
  { _id: true }
);

/**
 * @typedef {Object} SocialLink
 * @property {string} platform - Platform name (e.g., LinkedIn, GitHub)
 * @property {string} url - Full URL to the social profile
 */
const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String },
    url: { type: String },
  },
  { _id: true }
);

// ─── Main User Schema ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} User
 * @property {string} name - Full name of the user
 * @property {string} email - Unique email address (lowercase, trimmed)
 * @property {string} password - Hashed password (excluded from queries by default)
 * @property {string} role - User role: 'candidate', 'recruiter', or 'admin'
 * @property {boolean} isVerified - Whether the user's email has been verified
 * @property {string} verificationToken - Token used for email verification
 * @property {string} resetPasswordToken - Token used for password reset
 * @property {Date} resetPasswordExpire - Expiry date for the reset password token
 * @property {string} avatar - URL to the user's avatar image
 * @property {Object} profile - Nested profile information
 * @property {mongoose.Types.ObjectId} company - Reference to the user's company (recruiters)
 * @property {string} status - Account status: 'active' or 'suspended'
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Exclude password from query results by default
    },

    role: {
      type: String,
      enum: {
        values: ['candidate', 'recruiter', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'candidate',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    avatar: {
      type: String,
      default: '',
    },

    profile: {
      /** URL to the uploaded resume file */
      resume: { type: String },
      /** Original filename of the uploaded resume */
      resumeOriginalName: { type: String },
      /** Array of skill tags */
      skills: [{ type: String }],
      /** Short biography */
      bio: { type: String },
      /** Educational background entries */
      education: [educationSchema],
      /** Professional experience entries */
      experience: [experienceSchema],
      /** Professional certifications */
      certifications: [certificationSchema],
      /** Social media / portfolio links */
      socialLinks: [socialLinkSchema],
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },

    status: {
      type: String,
      enum: {
        values: ['active', 'suspended'],
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Note: email index is created automatically by the unique:true field definition above.

// ─── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Pre-save hook to hash the user's password before persisting to the database.
 * Only runs when the password field has been modified (e.g., registration or password change).
 * Uses bcryptjs with 12 salt rounds for strong, production-grade hashing.
 */
userSchema.pre('save', async function (next) {
  // Skip hashing if the password hasn't been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// ─── Instance Methods ───────────────────────────────────────────────────────────

/**
 * Compare a candidate (plain-text) password against the stored hashed password.
 *
 * @param {string} candidatePassword - The plain-text password to verify
 * @returns {Promise<boolean>} Resolves to true if the password matches, false otherwise
 *
 * @example
 * const user = await User.findOne({ email }).select('+password');
 * const isMatch = await user.comparePassword(enteredPassword);
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('User', userSchema);
