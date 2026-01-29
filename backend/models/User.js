import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { USER_ROLES, USER_STATUS } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Role must be either admin or wholesaler'
      },
      default: USER_ROLES.WHOLESALER
    },
    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: 'Invalid status value'
      },
      default: USER_STATUS.PENDING
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    businessName: {
      type: String,
      trim: true
    },
    businessLicense: {
      type: String,
      trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

/**
 * Pre-save middleware to hash password
 * Only runs if password is modified
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password
 * @param {String} enteredPassword - Password to compare
 * @returns {Boolean} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to generate JWT token
 * @returns {String} - JWT token
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Method to get user object without sensitive data
 * @returns {Object} - Safe user object
 */
userSchema.methods.toSafeObject = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
