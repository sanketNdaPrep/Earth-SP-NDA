'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  PREVIEW_ACTIVITY,
  PREVIEW_KPIS,
  PREVIEW_QUERIES,
  SHOW_SAMPLE_DATA,
} from '@/lib/admin-preview-data';
import { ActivityLog } from './activity-log';
import {
  BookStackIcon,
  ClipboardCheckIcon,
  LifebuoyIcon,
  LogoutIcon,
  PlusIcon,
  ShieldCheckIcon,
  UsersIcon,
} from './icons';
import { isDone } from './status-badge';
import { KpiGrid, type Kpi } from './kpi-grid';
import { Panel } from './panel';
import { QueriesPanel } from './queries-panel';
import { ReplyDialog } from './reply-dialog';
import { AssignedTasks, AssignWorkForm } from './tasks-panel';
import type { AdminProfile, QueryItem, Task } from './types';

const previewPill = (
  <span className="rounded-sm border border-steel-700 px-1.5 py-0.5 text-xs text-steel-300">
    Preview data
  </span>
);

export function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  // Contributions stats
  const [questionsAdded, setQuestionsAdded] = useState(0);
  const [resourcesAdded, setResourcesAdded] = useState(0);

  // Tasks and queries
  const [tasks, setTasks] = useState<Task[]>([]);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [sampleQueries, setSampleQueries] = useState<QueryItem[]>(PREVIEW_QUERIES);
  const [openQueryId, setOpenQueryId] = useState<string | null>(null);

  // Super admin controls
  const [allAdmins, setAllAdmins] = useState<AdminProfile[]>([]);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    async function initAdminWorkspace() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Check admin privileges
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.is_approved) {
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      setAdmin(profile);

      // Fetch contributions
      const { count: qCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);
      const { count: rCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);
      setQuestionsAdded(qCount || 0);
      setResourcesAdded(rCount || 0);

      // Fetch assigned tasks
      const { data: taskData } = await supabase
        .from('admin_tasks')
        .select('*')
        .eq('assigned_to', user.id);
      if (taskData) setTasks(taskData);

      // Fetch student queries
      const { data: queryData } = await supabase
        .from('student_queries')
        .select('*')
        .order('created_at', { ascending: false });
      if (queryData) setQueries(queryData);

      // Fetch all admin profiles for super admin task management
      const { data: adminList } = await supabase.from('admin_profiles').select('*');
      if (adminList) setAllAdmins(adminList);

      setLoading(false);
    }

    initAdminWorkspace();
  }, [router]);

  useEffect(() => {
    if (!statusMsg) return;
    const timer = setTimeout(() => setStatusMsg(null), 6000);
    return () => clearTimeout(timer);
  }, [statusMsg]);

  // Sample queries stand in only while the real table is empty.
  const showingSamples = SHOW_SAMPLE_DATA && queries.length === 0;
  const shownQueries = showingSamples ? sampleQueries : queries;
  const openQuery = shownQueries.find((query) => query.id === openQueryId) ?? null;
  const pendingCount = shownQueries.filter((query) => !isDone(query.status)).length;

  /** Resolves to an error message, or null once the reply is saved. */
  const handleResolveQuery = async (queryId: string, text: string): Promise<string | null> => {
    if (!text) return 'Write a reply first.';

    const target = shownQueries.find((query) => query.id === queryId);
    if (target?.preview) {
      setSampleQueries((previous) =>
        previous.map((query) =>
          query.id === queryId ? { ...query, status: 'resolved', admin_response: text } : query,
        ),
      );
      setStatusMsg({
        type: 'success',
        text: 'Sample reply shown on this screen only. Nothing was saved.',
      });
      return null;
    }

    const { error } = await supabase
      .from('student_queries')
      .update({
        status: 'resolved',
        admin_response: text,
        resolved_by: admin?.id,
      })
      .eq('id', queryId);

    if (error) return error.message;

    setStatusMsg({ type: 'success', text: 'Student query resolved and answer recorded!' });

    const { data: queryData } = await supabase
      .from('student_queries')
      .select('*')
      .order('created_at', { ascending: false });
    if (queryData) setQueries(queryData);
    return null;
  };

  /** Resolves to an error message, or null once the task is saved. */
  const handleAssignTask = async (
    assignedTo: string,
    title: string,
    details: string,
  ): Promise<string | null> => {
    const { error } = await supabase.from('admin_tasks').insert({
      assigned_to: assignedTo,
      task_title: title,
      task_description: details,
      status: 'pending',
    });

    if (error) return error.message;

    setStatusMsg({ type: 'success', text: 'Work assigned successfully!' });
    return null;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-950 px-5">
        <p role="status" className="text-sm text-steel-300">
          Checking admin access…
        </p>
      </div>
    );
  }

  const sampleKpi = (value: number, hint: string) =>
    SHOW_SAMPLE_DATA
      ? { value, hint, source: 'preview' as const }
      : { value: null, hint: 'Not connected to Supabase yet', source: 'live' as const };

  const kpis: Kpi[] = [
    {
      id: 'cadets',
      label: 'Total enrolled cadets',
      icon: <UsersIcon className="size-5" />,
      ...sampleKpi(PREVIEW_KPIS.enrolledCadets.value, PREVIEW_KPIS.enrolledCadets.hint),
    },
    {
      id: 'questions',
      label: 'Questions in bank',
      icon: <BookStackIcon className="size-5" />,
      ...sampleKpi(PREVIEW_KPIS.questionsInBank.value, PREVIEW_KPIS.questionsInBank.hint),
    },
    {
      id: 'attempts',
      label: 'Tests attempted',
      icon: <ClipboardCheckIcon className="size-5" />,
      ...sampleKpi(PREVIEW_KPIS.testsAttempted.value, PREVIEW_KPIS.testsAttempted.hint),
    },
    {
      id: 'pending',
      label: 'Pending helpdesk queries',
      icon: <LifebuoyIcon className="size-5" />,
      value: pendingCount,
      hint: pendingCount === 0 ? 'Every query has a reply' : `${pendingCount} waiting for a reply`,
      source: showingSamples ? 'preview' : 'live',
      tone: pendingCount > 0 ? 'attention' : 'default',
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-8 sm:py-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="brackets border border-steel-700 bg-navy-900 px-5 py-5 sm:px-7 sm:py-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-md border border-gold-400/50 bg-gold-400/10 text-gold-300">
                <ShieldCheckIcon className="size-7" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="break-words text-xl font-semibold text-white sm:text-2xl">
                    Welcome, {admin?.full_name}
                  </h1>
                  <span className="rounded-sm border border-gold-400/40 bg-gold-400/10 px-2 py-0.5 text-xs font-medium text-gold-300">
                    {admin?.role === 'super_admin' ? 'Super admin' : 'Admin'}
                  </span>
                </div>
                <p className="mt-1 break-all text-sm text-steel-300">{admin?.email}</p>
                {admin?.phone_number ? (
                  <p className="text-sm text-steel-300">{admin.phone_number}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/seed"
                className="inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300"
              >
                <PlusIcon className="size-4" />
                Add content
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-md border border-steel-700 px-5 text-sm font-medium text-steel-100 transition-colors hover:border-steel-500 hover:bg-white/5"
              >
                <LogoutIcon className="size-4" />
                Log out
              </button>
            </div>
          </div>
        </motion.header>

        <AnimatePresence>
          {statusMsg ? (
            <motion.div
              key="status-message"
              role={statusMsg.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-6 flex items-start justify-between gap-4 border-l-2 px-4 py-3 text-sm ${
                statusMsg.type === 'success'
                  ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
                  : 'border-gold-400 bg-gold-400/10 text-gold-300'
              }`}
            >
              <p>{statusMsg.text}</p>
              <button
                type="button"
                onClick={() => setStatusMsg(null)}
                className="shrink-0 touch-manipulation font-medium underline underline-offset-4"
              >
                Dismiss
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-6">
          <KpiGrid items={kpis} />
        </div>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <QueriesPanel
            queries={shownQueries}
            showingSamples={showingSamples}
            onOpen={(query) => setOpenQueryId(query.id)}
          />

          <Panel
            title="Platform activity"
            description="Latest events across the portal."
            action={SHOW_SAMPLE_DATA ? previewPill : undefined}
            delay={0.45}
          >
            <ActivityLog events={SHOW_SAMPLE_DATA ? PREVIEW_ACTIVITY : []} />
          </Panel>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <AssignedTasks tasks={tasks} />

            <Panel
              title="Your contributions"
              description="Content you have added to the portal."
              delay={0.7}
            >
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-b-md bg-steel-700/60">
                <div className="bg-navy-900 px-5 py-5 sm:px-6">
                  <dt className="text-sm text-steel-300">Questions added</dt>
                  <dd className="mt-1 text-3xl font-semibold tabular-nums text-white">
                    {questionsAdded}
                  </dd>
                </div>
                <div className="bg-navy-900 px-5 py-5 sm:px-6">
                  <dt className="text-sm text-steel-300">PDFs published</dt>
                  <dd className="mt-1 text-3xl font-semibold tabular-nums text-emerald-300">
                    {resourcesAdded}
                  </dd>
                </div>
              </dl>
            </Panel>
          </div>

          <AssignWorkForm admins={allAdmins} onAssign={handleAssignTask} />
        </div>

        {openQuery ? (
          <ReplyDialog
            key={openQuery.id}
            query={openQuery}
            onClose={() => setOpenQueryId(null)}
            onSend={handleResolveQuery}
          />
        ) : null}
      </main>
    </MotionConfig>
  );
}