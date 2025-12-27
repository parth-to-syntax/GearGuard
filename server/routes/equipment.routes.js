import express from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats,
  generateCode,
  getCategories,
  updateHealthStatus,
  scrapEquipment,
  createMaintenanceFromEquipment
} from '../controllers/equipment.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const equipmentValidation = [
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
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('serialNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  body('model')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Model cannot exceed 100 characters'),
  body('manufacturer')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Manufacturer cannot exceed 100 characters'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['OPERATIONAL', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'DECOMMISSIONED'])
    .withMessage('Invalid status'),
  body('categoryId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid category ID'),
  body('workCenterId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid work center ID'),
  body('departmentId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid department ID'),
  // New fields from design.json
  body('usedById')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid user ID for usedBy'),
  body('defaultTechnicianId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid technician ID'),
  body('maintenanceTeamId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid maintenance team ID'),
  body('assignedDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid assigned date format'),
  body('workContact')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Work contact cannot exceed 200 characters')
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
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('serialNumber')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Serial number cannot exceed 100 characters'),
  body('model')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Model cannot exceed 100 characters'),
  body('manufacturer')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Manufacturer cannot exceed 100 characters'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  body('status')
    .optional()
    .isIn(['OPERATIONAL', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'DECOMMISSIONED'])
    .withMessage('Invalid status'),
  body('healthScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Health score must be between 0 and 100'),
  body('healthStatus')
    .optional()
    .isIn(['HEALTHY', 'WARNING', 'CRITICAL'])
    .withMessage('Invalid health status'),
  body('categoryId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid category ID'),
  body('workCenterId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid work center ID'),
  body('departmentId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid department ID'),
  // New fields from design.json
  body('usedById')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid user ID for usedBy'),
  body('defaultTechnicianId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid technician ID'),
  body('maintenanceTeamId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid maintenance team ID'),
  body('assignedDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid assigned date format'),
  body('workContact')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Work contact cannot exceed 200 characters')
];

const healthValidation = [
  body('healthScore')
    .notEmpty()
    .withMessage('Health score is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Health score must be between 0 and 100'),
  body('healthStatus')
    .notEmpty()
    .withMessage('Health status is required')
    .isIn(['HEALTHY', 'WARNING', 'CRITICAL'])
    .withMessage('Invalid health status')
];

const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid equipment ID')
];

// Routes
router.get('/', getEquipment);
router.get('/generate-code', generateCode);
router.get('/categories', getCategories);
router.get('/:id', idValidation, validate, getEquipmentById);
router.get('/:id/stats', idValidation, validate, getEquipmentStats);
router.post('/', authorize('ADMIN', 'MANAGER'), equipmentValidation, validate, createEquipment);
router.put('/:id', authorize('ADMIN', 'MANAGER'), [...idValidation, ...updateValidation], validate, updateEquipment);
router.put('/:id/health', authorize('ADMIN', 'MANAGER', 'TECHNICIAN'), [...idValidation, ...healthValidation], validate, updateHealthStatus);
router.put('/:id/scrap', authorize('ADMIN', 'MANAGER'), idValidation, validate, scrapEquipment);
router.post('/:id/maintenance-request', idValidation, validate, createMaintenanceFromEquipment);
router.delete('/:id', authorize('ADMIN'), idValidation, validate, deleteEquipment);

export default router;
