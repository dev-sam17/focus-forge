// controllers/trackerController.ts
import {
    addTracker,
    startTracker,
    stopTracker,
    archiveTracker,
    deleteTracker,
    getAllTrackers,
    getAllActiveSessions,
    getSessions,
    computeWorkStatsByTrackerId,
} from './trackerService.js';

import { Request, Response } from 'express';

export const createTracker = (req: Request, res: Response) => {

    const { tracker_name, target_hours, description } = req.body;
    console.log('createTracker', tracker_name, target_hours, description);
    const result = addTracker(tracker_name, target_hours, description);
    res.json(result);
};

export const beginTracker = (req: Request, res: Response) => {
    const { trackerId } = req.params;
    const result = startTracker(trackerId);
    res.json(result);
};

export const endTracker = (req: Request, res: Response) => {
    const { trackerId } = req.params;
    const result = stopTracker(trackerId);
    res.json(result);
};

export const markArchived = (req: Request, res: Response) => {
    const { trackerId } = req.params;
    const result = archiveTracker(trackerId);
    res.json(result);
};

export const removeTracker = (req: Request, res: Response) => {
    const { trackerId } = req.params;
    const result = deleteTracker(trackerId);
    res.json(result);
};

export const listTrackers = (_req: Request, res: Response) => {
    const result = getAllTrackers();
    res.json(result);
};

export const listActiveSessions = (req: Request, res: Response) => {
    const result = getAllActiveSessions();
    res.json(result);
};

export const listSessions = (req: Request, res: Response) => {
    const { trackerId } = req.params;
    const result = getSessions(trackerId);
    res.json(result);
};

export const statsByTracker = (req: Request, res: Response) => {
    const { trackerId } = req.params;
    const result = computeWorkStatsByTrackerId(trackerId);
    res.json(result);
};
