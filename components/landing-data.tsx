'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { MotionConfig } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export interface UserData {
  name: string;
  email: string;
  targetExam: string;
}

export interface UserStats {
  totalTests: number;
  avgAccuracy: number;
}

export interface ResourcePdf {
  id: string;
  title: string;
  category: string;
  size: string;
  downloads: number;
  recommended_for: string;
  download_url: string;
}

interface AttemptRow {
  score: number;
  total_questions: number;
}

interface LandingData {
  user: UserData | null;
  stats: UserStats;
  resources: ResourcePdf[];
  resourcesState: 'loading' | 'ready';
  downloadedFiles: string[];
  notice: string | null;
  handleDownload: (file: ResourcePdf) => Promise<void>;
}

const LandingDataContext = createContext<LandingData | null>(null);

export function useLandingData(): LandingData {
  const value = useContext(LandingDataContext);
  if (!value) {
    throw new Error('useLandingData must be used inside <LandingProviders>.');
  }
  return value;
}

export function LandingProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalTests: 0, avgAccuracy: 0 });
  const [resources, setResources] = useState<ResourcePdf[]>([]);
  const [resourcesState, setResourcesState] = useState<'loading' | 'ready'>('loading');
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!active) return;

        if (authData?.user) {
          setUser({
            name: authData.user.user_metadata?.full_name || 'Cadet',
            email: authData.user.email || '',
            targetExam: authData.user.user_metadata?.target_exam || 'NDA / CDS',
          });

          const { data: attemptData } = await supabase
            .from('user_quiz_attempts')
            .select('score, total_questions')
            .eq('user_id', authData.user.id);

          if (active && attemptData && attemptData.length > 0) {
            const rows = attemptData as AttemptRow[];
            const totalTests = rows.length;
            const totalScore = rows.reduce((acc, curr) => acc + curr.score, 0);
            const totalPossible = rows.reduce((acc, curr) => acc + curr.total_questions, 0);
            const avgAccuracy =
              totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

            setStats({ totalTests, avgAccuracy });
          }
        }

        const { data: resData } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (active && resData) {
          setResources(resData as ResourcePdf[]);
        }
      } catch {
        // Fallback handled smoothly
      } finally {
        if (active) setResourcesState('ready');
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleDownload = useCallback(async (file: ResourcePdf) => {
    const hasLink = Boolean(file.download_url) && file.download_url !== '#';

    if (hasLink) {
      window.open(file.download_url, '_blank', 'noopener,noreferrer');
    } else {
      setNotice(`"${file.title}" doesn't have a download link yet.`);
    }

    setDownloadedFiles((prev) => (prev.includes(file.title) ? prev : [...prev, file.title]));

    await supabase
      .from('resources')
      .update({ downloads: (file.downloads || 0) + 1 })
      .eq('id', file.id);
  }, []);

  const value = useMemo<LandingData>(
    () => ({
      user,
      stats,
      resources,
      resourcesState,
      downloadedFiles,
      notice,
      handleDownload,
    }),
    [user, stats, resources, resourcesState, downloadedFiles, notice, handleDownload],
  );

  return (
    <MotionConfig reducedMotion="user">
      <LandingDataContext.Provider value={value}>{children}</LandingDataContext.Provider>
    </MotionConfig>
  );
}