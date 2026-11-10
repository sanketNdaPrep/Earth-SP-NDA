-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin', 'moderator')),
  target_exam TEXT DEFAULT 'NDA' CHECK (target_exam IN ('NDA', 'CDS', 'AFCAT')),
  target_year INT DEFAULT 2027,
  daily_goal_minutes INT DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject Progress Table
CREATE TABLE public.subject_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_name TEXT NOT NULL,
  total_questions_attempted INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
  time_spent_minutes INT DEFAULT 0,
  last_studied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock Tests Table
CREATE TABLE public.mock_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  target_exam TEXT NOT NULL CHECK (target_exam IN ('NDA', 'CDS', 'AFCAT')),
  total_questions INT NOT NULL,
  duration_minutes INT NOT NULL,
  total_marks INT NOT NULL,
  passing_marks INT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions Table
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  explanation TEXT,
  marks NUMERIC(4,2) DEFAULT 2.50,
  negative_marks NUMERIC(4,2) DEFAULT 0.83,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test Attempts Table
CREATE TABLE public.test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mock_test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC(6,2) DEFAULT 0.00,
  total_attempted INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
  time_taken_seconds INT DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Study Logs Table
CREATE TABLE public.study_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  minutes_studied INT NOT NULL,
  questions_solved INT DEFAULT 0,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public mock tests read access" ON public.mock_tests FOR SELECT USING (true);
CREATE POLICY "Public questions read access" ON public.questions FOR SELECT USING (true);

-- User data access policies
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own study logs" ON public.study_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own test attempts" ON public.test_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own subject progress" ON public.subject_progress FOR ALL USING (auth.uid() = user_id);