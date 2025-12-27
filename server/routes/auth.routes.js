import express from 'express';
import { body } from 'express-validator';
import { 
  signup, 
  login, 
  getMe, 
  updateProfile, 
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Validation rules matching design.json specifications
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 9 })
    .withMessage('Password length should be more than 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a small case letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain a large case letter')
    .matches(/[^a-zA-Z0-9]/)
    .withMessage('Password must contain a special character'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 9 })
    .withMessage('Password length should be more than 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a small case letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain a large case letter')
    .matches(/[^a-zA-Z0-9]/)
    .withMessage('Password must contain a special character'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 9 })
    .withMessage('Password length should be more than 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a small case letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain a large case letter')
    .matches(/[^a-zA-Z0-9]/)
    .withMessage('Password must contain a special character'),
];

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

export default router;
