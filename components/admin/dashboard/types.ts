export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  is_approved: boolean;
  role?: string;
}

export interface QueryItem {
  id: string;
  student_name: string;
  student_email: string;
  query_text: string;
  status: string;
  created_at: string;
  admin_response?: string;
  preview?: boolean;
}

export interface Task {
  id: string;
  assigned_to: string;
  task_title: string;
  task_description: string;
  status: string;
}

export type ActivityTone = 'ok' | 'info' | 'highlight';

export interface ActivityEvent {
  id: string;
  label: string;
  text: string;
  at: string;
  tone: ActivityTone;
}