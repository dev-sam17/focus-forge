import Database from 'better-sqlite3';

const db = new Database('time_tracker.db');

// Define types
interface ActiveSession {
    tracker_id: string;
    start_time: number;
}

interface Session {
    tracker_id: string;
    start_time: number;
    end_time: number;
    duration_minutes: number;
}

interface Tracker {
    id: string;
    tracker_name: string;
    target_hours: number;
    archived: number;
    description: string;
}

// Initialize DB tables
export function initDB() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS trackers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_hours INTEGER NOT NULL,
      tracker_name TEXT NOT NULL,
      archived INTEGER DEFAULT 0,
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracker_id TEXT,
      start_time INTEGER,
      end_time INTEGER,
      duration_minutes INTEGER,
      FOREIGN KEY(tracker_id) REFERENCES trackers(id)
    );

    CREATE TABLE IF NOT EXISTS active_sessions (
      tracker_id TEXT PRIMARY KEY,
      start_time INTEGER,
      FOREIGN KEY(tracker_id) REFERENCES trackers(id)
    );
  `);
}

// Helper function to get today's date in YYYY-MM-DD
function getDateStr(timestamp: number) {
    return new Date(timestamp).toISOString().split('T')[0];
}

// Add tracker
export function addTracker(tracker_name: string, targetHours: number, description: string) {
    try {
        db.prepare('INSERT INTO trackers (tracker_name, target_hours, description) VALUES (?,?,?)').run(tracker_name, targetHours, description);
        console.log(`Added tracker with target hours: ${targetHours}`);
        return { success: true, message: 'Tracker added.', data: { tracker_name, targetHours, description } };
    } catch (err) {
        console.log(`Target Hours: ${targetHours} Error adding tracker: ${(err as Error).message}`);
        return { success: false, error: (err as Error).message };
    }
}

// Start tracker
export function startTracker(trackerId: string) {
    try {
        const existing = db.prepare('SELECT * FROM active_sessions WHERE tracker_id = ?').get(trackerId);
        if (!existing) {
            const startTime = Date.now();
            db.prepare('INSERT INTO active_sessions (tracker_id, start_time) VALUES (?, ?)')
                .run(trackerId, startTime);
        }
        return { success: true, message: 'Tracker started.' };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Stop tracker
export function stopTracker(trackerId: string) {
    try {
        const activeSession = db.prepare('SELECT * FROM active_sessions WHERE tracker_id = ?').get(trackerId) as ActiveSession | undefined;
        if (!activeSession || !('start_time' in activeSession)) return { success: false, error: 'No active session found.' };

        const endTime = Date.now();
        const durationMinutes = Math.floor((endTime - activeSession.start_time) / 60000);

        db.prepare(`
      INSERT INTO sessions (tracker_id, start_time, end_time, duration_minutes)
      VALUES (?, ?, ?, ?)
    `).run(trackerId, activeSession.start_time, endTime, durationMinutes);

        db.prepare('DELETE FROM active_sessions WHERE tracker_id = ?').run(trackerId);
        return { success: true, message: 'Tracker stopped and session recorded.' };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Archive tracker
export function archiveTracker(trackerId: string) {
    try {
        db.prepare('UPDATE trackers SET archived = 1 WHERE id = ?').run(trackerId);
        return { success: true, message: 'Tracker archived.' };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Delete tracker
export function deleteTracker(trackerId: string) {
    try {
        db.prepare('DELETE FROM sessions WHERE tracker_id = ?').run(trackerId);
        db.prepare('DELETE FROM active_sessions WHERE tracker_id = ?').run(trackerId);
        db.prepare('DELETE FROM trackers WHERE id = ?').run(trackerId);
        return { success: true, message: 'Tracker deleted.' };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Get all trackers
export function getAllTrackers() {
    try {
        const rows = db.prepare('SELECT * FROM trackers').all();
        return { success: true, data: rows };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Get active sessions for a tracker
export function getAllActiveSessions() {
    try {
        const rows = db.prepare('SELECT * FROM active_sessions').all();
        return { success: true, data: rows };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}


// Get all sessions for a tracker
export function getSessions(trackerId: string) {
    try {
        const rows = db.prepare('SELECT * FROM sessions WHERE tracker_id = ?').all(trackerId);
        return { success: true, data: rows };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

// Compute work debt and advance for a specific tracker
export function computeWorkStatsByTrackerId(trackerId: string) {
    try {
        const tracker = db.prepare('SELECT id, target_hours FROM trackers WHERE id = ?').get(trackerId) as Tracker;
        if (!tracker) return { success: false, error: 'Tracker not found.' };

        const sessions = db.prepare('SELECT * FROM sessions WHERE tracker_id = ?').all(trackerId) as Session[];
        const dailyTotals: Record<string, number> = {};

        for (const session of sessions) {
            const date = getDateStr(session.start_time);
            dailyTotals[date] = (dailyTotals[date] || 0) + session.duration_minutes;
        }

        // for (const [date, minutes] of Object.entries(dailyTotals)) {
        //     const hours = minutes / 60;
        //     const day = new Date(date).getDay();

        //     if (day === 0 || day === 6) {
        //         workAdvance += hours;
        //     } else if (hours < tracker.target_hours) {
        //         workDebt += (tracker.target_hours - hours);
        //     } else {
        //         workAdvance += (hours - tracker.target_hours);
        //     }
        // }

        let totalWorkDays = 0;
        let totalWorkHours = 0;
        let workAdvance = 0;
        let workDebt = 0;

        for (const [date, minutes] of Object.entries(dailyTotals)) {
            const hours = minutes / 60;
            const day = new Date(date).getDay();

            if (day === 0 || day === 6) {
                totalWorkHours += hours;
            } else {
                totalWorkDays += 1;
                totalWorkHours += hours;
            }
        }

        const targetWorkHours = totalWorkDays * tracker.target_hours;
        if (targetWorkHours > totalWorkHours) {
            workDebt = targetWorkHours - totalWorkHours;
        } else {
            workAdvance = targetWorkHours - totalWorkHours;
        }

        const result = {
            work_debt: parseFloat(workDebt.toFixed(2)),
            work_advance: parseFloat(workAdvance.toFixed(2)),
        };

        return { success: true, data: result };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}



// Initialize DB on first run
initDB();
