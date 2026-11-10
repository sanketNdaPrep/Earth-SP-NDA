import { TargetExamType } from "./database";

export interface StudentDashboardSummary {
  userId: string;
  fullName: string;
  targetExam: TargetExamType;
  overallScore: number;
  maxScore: number;
  totalMocksAttempted: number;
  averageAccuracy: number;
  studyStreakDays: number;
  weeklyHoursLogged: number;
}

export interface SubjectAccuracyMetric {
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
  trend: "up" | "down" | "flat";
}

export interface UpcomingExamNotice {
  id: string;
  title: string;
  examDate: string;
  daysRemaining: number;
  officialNotificationUrl: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  timestamp: string;
  category: "mock" | "study" | "revision";
  scoreText?: string;
}