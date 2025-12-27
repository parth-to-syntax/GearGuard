import express from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getWorkCenters,
  getWorkCenter,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  getWorkCenterStats,
  generateCode
} from '../controllers/workcenters.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const workCenterValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Code can only contain letters, numbers, and hyphens'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a positive number'),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid department ID'),
  body('teamIds')
    .optional()
    .isArray()
    .withMessage('Team IDs must be an array'),
  body('teamIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid team ID')
];

const updateValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Code can only contain letters, numbers, and hyphens'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a positive number'),
  body('departmentId')
    .optional()
    .isUUID()
    .withMessage('Invalid department ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('teamIds')
    .optional()
    .isArray()
    .withMessage('Team IDs must be an array'),
  body('teamIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid team ID')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid work center ID')
];

// Routes
router.get('/', getWorkCenters);
router.get('/generate-code', generateCode);
router.get('/:id', idValidation, validate, getWorkCenter);
router.get('/:id/stats', idValidation, validate, getWorkCenterStats);
router.post('/', authorize('ADMIN', 'MANAGER'), workCenterValidation, validate, createWorkCenter);
router.put('/:id', authorize('ADMIN', 'MANAGER'), [...idValidation, ...updateValidation], validate, updateWorkCenter);
router.delete('/:id', authorize('ADMIN'), idValidation, validate, deleteWorkCenter);

export default router;
