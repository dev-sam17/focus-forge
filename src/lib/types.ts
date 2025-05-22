
export interface ActiveSession {
  trackerId: string;
  startTime: number;
}

export interface Session {
  trackerId: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface Tracker {
  id: string;
  trackerName: string;
  targetHours: number;
  archived: number;
  workDays: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
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
  startTime: Date
  endTime: Date
  duration: number
}

export interface DailyStatistics {
  date: Date
  hours: number
}

export interface TaskDistribution {
  taskId: string
  taskName: string
  percentage: number
  hours: number
}

export interface ProductivityData {
  date: Date
  score: number
}
