
export interface ActiveSession {
  trackerId: string;
  startTime: number;
}

export interface Session {
  trackerId: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
}

export interface Tracker {
  id: string;
  trackerName: string;
  targetHours: number;
  archived: number;
  description: string;
}

export interface NewTracker {
  trackerName: string;
  targetHours: number;
  description?: string;
}

export interface WorkStats {
  workDebt: number;
  workAdvance: number;
} 

export interface SessionData {
  id: string
  taskId: string
  startTime: number
  endTime: number
  duration: number
}

export interface DailyStatistics {
  date: string
  hours: number
}

export interface TaskDistribution {
  taskId: string
  taskName: string
  percentage: number
  hours: number
}

export interface ProductivityData {
  date: string
  score: number
}
