'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'super_admin' | 'admin';
  is_approved: boolean;
}

interface Task {
  id: string;
  task_title: string;
  task_description: string;
  status: string;
}

interface QueryItem {
  id: string;
  student_name: string;
  student_email: string;
  query_text: string;
  status: string;
  admin_response?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  // Contributions Stats
  const [questionsAdded, setQuestionsAdded] = useState(0);
  const [resourcesAdded, setResourcesAdded] = useState(0);

  // Tasks & Queries State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<{ id: string; text: string }>({ id: '', text: '' });

  // Super Admin Controls
  const [allAdmins, setAllAdmins] = useState<AdminProfile[]>([]);
  const [assignTargetAdmin, setAssignTargetAdmin] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function initAdminWorkspace() {
      const { data: { user } } = await supabase.auth.getUser();

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
      const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('created_by', user.id);
      const { count: rCount } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('created_by', user.id);
      setQuestionsAdded(qCount || 0);
      setResourcesAdded(rCount || 0);

      // Fetch assigned tasks
      const { data: taskData } = await supabase.from('admin_tasks').select('*').eq('assigned_to', user.id);
      if (taskData) setTasks(taskData);

      // Fetch student queries
      const { data: queryData } = await supabase.from('student_queries').select('*').order('created_at', { ascending: false });
      if (queryData) setQueries(queryData);

      // Fetch all admin profiles for Super Admin task management
      const { data: adminList } = await supabase.from('admin_profiles').select('*');
      if (adminList) {
        setAllAdmins(adminList);
        if (adminList.length > 0) setAssignTargetAdmin(adminList[0].id);
      }

      setLoading(false);
    }

    initAdminWorkspace();
  }, [router]);

  const handleResolveQuery = async (queryId: string) => {
    if (!selectedResponse.text) return;

    await supabase
      .from('student_queries')
      .update({
        status: 'resolved',
        admin_response: selectedResponse.text,
        resolved_by: admin?.id,
      })
      .eq('id', queryId);

    setStatusMsg({ type: 'success', text: 'Student query resolved and answer recorded!' });
    setSelectedResponse({ id: '', text: '' });
    
    const { data: queryData } = await supabase.from('student_queries').select('*').order('created_at', { ascending: false });
    if (queryData) setQueries(queryData);
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetAdmin) return;

    await supabase.from('admin_tasks').insert({
      assigned_to: assignTargetAdmin,
      task_title: newTaskTitle,
      task_description: newTaskDesc,
      status: 'pending',
    });

    setStatusMsg({ type: 'success', text: 'Work assigned successfully!' });
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans text-sm">
        Authenticating Admin Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Authorized Admin Workspace
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2">Welcome, {admin?.full_name}</h1>
            <p className="text-xs text-slate-400 mt-1">Email: {admin?.email} • Contact: {admin?.phone_number}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/seed" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all">
              + Add Content & Questions
            </Link>
            <button onClick={handleSignOut} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all">
              Sign Out
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl border text-xs font-semibold ${
            statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold uppercase">Questions Contributed By You</span>
            <p className="text-3xl font-black text-white mt-1">{questionsAdded} Questions</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold uppercase">PDF Resources Published By You</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">{resourcesAdded} Documents</p>
          </div>
        </div>

        {/* Assigned Work Board */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">📌 Your Assigned Tasks & Work</h2>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No pending tasks currently assigned to you.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((t) => (
                <div key={t.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">{t.task_title}</h3>
                    <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">{t.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.task_description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Queries Section */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">💬 Student Queries & Support</h2>
          <div className="space-y-4">
            {queries.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No student queries registered yet.</p>
            ) : (
              queries.map((q) => (
                <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">{q.student_name} ({q.student_email})</span>
                      <p className="text-sm font-medium text-white mt-1">{q.query_text}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      q.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  {q.status === 'resolved' ? (
                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <strong className="text-emerald-400">Admin Response:</strong> {q.admin_response}
                    </p>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <textarea
                        rows={2}
                        placeholder="Type response to student..."
                        value={selectedResponse.id === q.id ? selectedResponse.text : ''}
                        onChange={(e) => setSelectedResponse({ id: q.id, text: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                      />
                      <button
                        onClick={() => handleResolveQuery(q.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        Send Response
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Assignment Controls */}
        <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3">👑 Task Assignment Control</h2>
          <form onSubmit={handleAssignTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Target Admin</label>
                <select
                  value={assignTargetAdmin}
                  onChange={(e) => setAssignTargetAdmin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500 outline-none"
                >
                  {allAdmins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Task Title</label>
                <input
                  required
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Upload 15 Trigonometry Questions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Task Directives & Details</label>
              <textarea
                required
                rows={2}
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Instructions for the assigned admin..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none"
              />
            </div>

            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all">
              Assign Work to Selected Admin
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}