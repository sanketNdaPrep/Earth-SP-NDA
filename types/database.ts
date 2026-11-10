export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TargetExamType = "NDA" | "CDS" | "AFCAT";
export type UserRole = "student" | "admin" | "moderator";
export type AttemptStatus = "in_progress" | "completed" | "abandoned";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          target_exam: TargetExamType;
          target_year: number;
          daily_goal_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          target_exam?: TargetExamType;
          target_year?: number;
          daily_goal_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          target_exam?: TargetExamType;
          target_year?: number;
          daily_goal_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      subject_progress: {
        Row: {
          id: string;
          user_id: string;
          subject_name: string;
          total_questions_attempted: number;
          correct_answers: number;
          accuracy_percentage: number;
          time_spent_minutes: number;
          last_studied_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_name: string;
          total_questions_attempted?: number;
          correct_answers?: number;
          accuracy_percentage?: number;
          time_spent_minutes?: number;
          last_studied_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_name?: string;
          total_questions_attempted?: number;
          correct_answers?: number;
          accuracy_percentage?: number;
          time_spent_minutes?: number;
          last_studied_at?: string;
        };
      };
      mock_tests: {
        Row: {
          id: string;
          title: string;
          code: string;
          target_exam: TargetExamType;
          total_questions: number;
          duration_minutes: number;
          total_marks: number;
          passing_marks: number;
          is_published: boolean;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          code: string;
          target_exam: TargetExamType;
          total_questions: number;
          duration_minutes: number;
          total_marks: number;
          passing_marks: number;
          is_published?: boolean;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          code?: string;
          target_exam?: TargetExamType;
          total_questions?: number;
          duration_minutes?: number;
          total_marks?: number;
          passing_marks?: number;
          is_published?: boolean;
          created_by?: string;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          mock_test_id: string;
          subject: string;
          topic: string;
          question_text: string;
          options: Json;
          correct_option_index: number;
          explanation: string | null;
          marks: number;
          negative_marks: number;
          difficulty: QuestionDifficulty;
          created_at: string;
        };
        Insert: {
          id?: string;
          mock_test_id: string;
          subject: string;
          topic: string;
          question_text: string;
          options: Json;
          correct_option_index: number;
          explanation?: string | null;
          marks?: number;
          negative_marks?: number;
          difficulty?: QuestionDifficulty;
          created_at?: string;
        };
        Update: {
          id?: string;
          mock_test_id?: string;
          subject?: string;
          topic?: string;
          question_text?: string;
          options?: Json;
          correct_option_index?: number;
          explanation?: string | null;
          marks?: number;
          negative_marks?: number;
          difficulty?: QuestionDifficulty;
          created_at?: string;
        };
      };
      test_attempts: {
        Row: {
          id: string;
          user_id: string;
          mock_test_id: string;
          score: number;
          total_attempted: number;
          correct_count: number;
          wrong_count: number;
          accuracy_percentage: number;
          time_taken_seconds: number;
          status: AttemptStatus;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          mock_test_id: string;
          score?: number;
          total_attempted?: number;
          correct_count?: number;
          wrong_count?: number;
          accuracy_percentage?: number;
          time_taken_seconds?: number;
          status?: AttemptStatus;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          mock_test_id?: string;
          score?: number;
          total_attempted?: number;
          correct_count?: number;
          wrong_count?: number;
          accuracy_percentage?: number;
          time_taken_seconds?: number;
          status?: AttemptStatus;
          started_at?: string;
          completed_at?: string | null;
        };
      };
      study_logs: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          minutes_studied: number;
          questions_solved: number;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          minutes_studied: number;
          questions_solved?: number;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          minutes_studied?: number;
          questions_solved?: number;
          notes?: string | null;
          logged_at?: string;
        };
      };
    };
  };
}