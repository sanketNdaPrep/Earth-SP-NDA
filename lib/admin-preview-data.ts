import type { ActivityEvent, QueryItem } from '@/components/admin/dashboard/types';

export const SHOW_SAMPLE_DATA = true;

export const PREVIEW_KPIS = {
  enrolledCadets: { value: 1420, hint: 'Active NDA aspirants' },
  questionsInBank: { value: 3850, hint: 'Maths, GAT & English' },
  testsAttempted: { value: 12450, hint: 'Mock tests completed' },
};

export const PREVIEW_QUERIES: QueryItem[] = [
  {
    id: 'sample-1',
    student_name: 'Cadet Rohan Sharma',
    student_email: 'rohan.s@gmail.com',
    query_text: 'Is the Trigonometry PYQ section updated with recent NDA exam questions?',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    preview: true,
  },
  {
    id: 'sample-2',
    student_name: 'Cadet Ananya Verma',
    student_email: 'ananya.v@gmail.com',
    query_text: 'Where can I find the PDF solution for GAT Geography Chapter 4?',
    status: 'resolved',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    admin_response: 'You can download the GAT Geography solutions directly from the Vault section.',
    preview: true,
  },
];

export const PREVIEW_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    label: 'Question added',
    text: 'Admin added 25 new Vector Algebra practice questions.',
    at: new Date(Date.now() - 3600000 * 3).toISOString(),
    tone: 'ok',
  },
  {
    id: 'act-2',
    label: 'New cadet',
    text: '12 new cadets joined the EARTH SP NDA portal today.',
    at: new Date(Date.now() - 3600000 * 8).toISOString(),
    tone: 'info',
  },
  {
    id: 'act-3',
    label: 'Resource published',
    text: 'New NDA English Mock Paper PDF uploaded to Vault.',
    at: new Date(Date.now() - 3600000 * 18).toISOString(),
    tone: 'highlight',
  },
];