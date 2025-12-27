import express from 'express';
import { getKPIs, getRecentRequests, getStats, getReports } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// @route   GET /api/dashboard/kpis
// @desc    Get dashboard KPI cards data
// @access  Private
router.get('/kpis', getKPIs);

// @route   GET /api/dashboard/recent-requests
// @desc    Get recent maintenance requests for table
// @access  Private
router.get('/recent-requests', getRecentRequests);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', getStats);

// @route   GET /api/dashboard/reports
// @desc    Get reports and analytics data
// @access  Private
router.get('/reports', getReports);

export default router;
