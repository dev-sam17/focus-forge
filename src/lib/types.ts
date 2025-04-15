
export interface ActiveSession {
  tracker_id: string;
  start_time: number;
}

export interface Session {
  tracker_id: string;
  start_time: number;
  end_time: number;
  duration_minutes: number;
}

export interface Tracker {
  id: string;
  tracker_name: string;
  target_hours: number;
  archived: number;
  description: string;
}

export interface NewTracker {
  tracker_name: string;
  target_hours: number;
  description?: string;
}

export interface WorkStats {
  work_debt: number;
  work_advance: number;
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
