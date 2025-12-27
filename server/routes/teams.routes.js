import express from 'express';
import { body, param } from 'express-validator';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  getAvailableUsers,
  getTeamStats
} from '../controllers/teams.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// Validation rules
const createTeamValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('leaderId')
    .optional()
    .isUUID()
    .withMessage('Invalid leader ID'),
  body('workCenterId')
    .optional()
    .isUUID()
    .withMessage('Invalid work center ID'),
  body('memberIds')
    .optional()
    .isArray()
    .withMessage('Member IDs must be an array'),
  body('memberIds.*')
    .optional()
    .isUUID()
    .withMessage('Invalid member ID')
];

const updateTeamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid team ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('leaderId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid leader ID'),
  body('workCenterId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid work center ID'),
  body('memberIds')
    .optional()
    .isArray()
    .withMessage('Member IDs must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const memberValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid team ID'),
  body('userId')
    .isUUID()
    .withMessage('Invalid user ID')
];

// All routes require authentication
router.use(protect);

// Routes
// GET /api/teams - Get all teams
router.get('/', getTeams);

// GET /api/teams/available-users - Get available users for team assignment
router.get('/available-users', getAvailableUsers);

// GET /api/teams/:id - Get single team
router.get('/:id', param('id').isUUID().withMessage('Invalid team ID'), validate, getTeam);

// GET /api/teams/:id/stats - Get team statistics
router.get('/:id/stats', param('id').isUUID().withMessage('Invalid team ID'), validate, getTeamStats);

// POST /api/teams - Create new team (managers and admins only)
router.post('/', authorize('ADMIN', 'MANAGER'), createTeamValidation, validate, createTeam);

// PUT /api/teams/:id - Update team
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateTeamValidation, validate, updateTeam);

// DELETE /api/teams/:id - Delete team
router.delete('/:id', authorize('ADMIN', 'MANAGER'), param('id').isUUID().withMessage('Invalid team ID'), validate, deleteTeam);

// POST /api/teams/:id/members - Add member to team
router.post('/:id/members', authorize('ADMIN', 'MANAGER'), memberValidation, validate, addMember);

// DELETE /api/teams/:id/members/:userId - Remove member from team
router.delete(
  '/:id/members/:userId',
  authorize('ADMIN', 'MANAGER'),
  [
    param('id').isUUID().withMessage('Invalid team ID'),
    param('userId').isUUID().withMessage('Invalid user ID')
  ],
  validate,
  removeMember
);

export default router;
