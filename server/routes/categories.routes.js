import express from 'express';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryTree 
} from '../controllers/categories.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize, checkPermission } from '../middleware/authorize.middleware.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('icon')
    .optional()
    .trim(),
  body('parentId')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid parent category ID'),
  // New field from design.json
  body('responsibleId')
    .optional({ nullable: true })
    .isUUID().withMessage('Invalid responsible user ID')
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid category ID')
];

// All routes require authentication
router.use(protect);

// Get all categories (hierarchical by default, flat with ?flat=true)
router.get('/', getAllCategories);

// Get category tree for dropdowns
router.get('/tree', getCategoryTree);

// Get single category
router.get('/:id', idValidation, validate, getCategoryById);

// Create category (Admin/Manager only)
router.post('/', 
  authorize('ADMIN', 'MANAGER'),
  categoryValidation, 
  validate, 
  createCategory
);

// Update category (Admin/Manager only)
router.put('/:id', 
  authorize('ADMIN', 'MANAGER'),
  [...idValidation, ...categoryValidation], 
  validate, 
  updateCategory
);

// Delete category (Admin only)
router.delete('/:id', 
  authorize('ADMIN'),
  idValidation, 
  validate, 
  deleteCategory
);

export default router;
