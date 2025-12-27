import express from 'express';
import { 
  getMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  updateStatus,
  deleteMaintenanceRequest,
  addComment,
  getKanbanData,
  getCalendarEvents
} from '../controllers/maintenance.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize, filterByRole } from '../middleware/authorize.middleware.js';

const router = express.Router();

// All routes require authentication and role filtering
router.use(protect);
router.use(filterByRole);

// @route   GET /api/maintenance-requests/kanban
// @desc    Get requests grouped by status for Kanban board
// @access  Private
router.get('/kanban', getKanbanData);

// @route   GET /api/maintenance-requests/calendar
// @desc    Get requests for calendar view
// @access  Private
router.get('/calendar', getCalendarEvents);

// @route   GET /api/maintenance-requests
// @desc    Get all maintenance requests with filters
// @access  Private
router.get('/', getMaintenanceRequests);

// @route   GET /api/maintenance-requests/:id
// @desc    Get single maintenance request
// @access  Private
router.get('/:id', getMaintenanceRequest);

// @route   POST /api/maintenance-requests
// @desc    Create new maintenance request
// @access  Private
router.post('/', createMaintenanceRequest);

// @route   PUT /api/maintenance-requests/:id
// @desc    Update maintenance request
// @access  Private
router.put('/:id', updateMaintenanceRequest);

// @route   PATCH /api/maintenance-requests/:id/status
// @desc    Update request status
// @access  Private
router.patch('/:id/status', updateStatus);

// @route   DELETE /api/maintenance-requests/:id
// @desc    Delete maintenance request
// @access  Private (Manager/Admin only)
router.delete('/:id', authorize('MANAGER', 'ADMIN'), deleteMaintenanceRequest);

// @route   POST /api/maintenance-requests/:id/comments
// @desc    Add comment to request
// @access  Private
router.post('/:id/comments', addComment);

export default router;
