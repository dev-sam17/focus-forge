// routes/trackerRoutes.ts
import express from 'express';
import {
    createTracker,
    beginTracker,
    endTracker,
    markArchived,
    removeTracker,
    listTrackers,
    listActiveSessions,
    listSessions,
    statsByTracker,
} from './trackerController.js';

const router = express.Router();

router.post('/trackers', createTracker);
router.get('/trackers/:trackerId/start', beginTracker);
router.get('/trackers/:trackerId/stop', endTracker);
router.get('/trackers/:trackerId/archive', markArchived);
router.delete('/trackers/:trackerId', removeTracker);
router.get('/trackers', listTrackers);
router.get('/trackers/activeSessions', listActiveSessions);
router.get('/trackers/:trackerId/sessions', listSessions);
router.get('/trackers/:trackerId/stats', statsByTracker);

export default router;
