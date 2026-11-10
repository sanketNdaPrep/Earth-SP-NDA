import { UserRole, TargetExamType } from "./database";

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  targetExam: TargetExamType;
  testsCompleted: number;
  avgAccuracy: number;
  createdAt: string;
  lastActive: string;
}

export interface ExamManagementItem {
  id: string;
  title: string;
  code: string;
  targetExam: TargetExamType;
  questionCount: number;
  durationMinutes: number;
  isPublished: boolean;
  totalAttemptsCount: number;
  createdAt: string;
}

export interface QuestionEditorPayload {
  mockTestId: string;
  subject: string;
  topic: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  marks: number;
  negativeMarks: number;
  difficulty: "easy" | "medium" | "hard";
}