'use client';

import { useId, useState, type FormEvent } from 'react';
import { Panel } from './panel';
import { StatusBadge } from './status-badge';
import type { AdminProfile, Task } from './types';

const fieldClass =
  'mt-2 w-full rounded-md border border-steel-700 bg-navy-950 px-3 text-base text-white placeholder:text-steel-300/70 focus-visible:border-emerald-400 sm:text-sm';

export function AssignedTasks({ tasks }: { tasks: Task[] }) {
  return (
    <Panel
      title="Your assigned tasks"
      description="Work the super admin has given you."
      delay={0.6}
    >
      {tasks.length === 0 ? (
        <p className="px-5 py-8 text-sm text-steel-300 sm:px-6">
          No tasks are assigned to you right now.
        </p>
      ) : (
        <ul className="divide-y divide-steel-700/40">
          {tasks.map((task) => (
            <li key={task.id} className="px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="break-words font-medium text-white">{task.task_title}</h3>
                <StatusBadge status={task.status} doneLabel="Done" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-300">
                {task.task_description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function AssignWorkForm({
  admins,
  onAssign,
}: {
  admins: AdminProfile[];
  /** Resolves to an error message, or null when the task was saved. */
  onAssign: (adminId: string, title: string, details: string) => Promise<string | null>;
}) {
  const [target, setTarget] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetFieldId = useId();
  const titleFieldId = useId();
  const detailsFieldId = useId();

  const targetId = target || admins[0]?.id || '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!targetId || sending) return;

    setSending(true);
    setError(null);
    const failure = await onAssign(targetId, title.trim(), details.trim());
    setSending(false);

    if (failure) {
      setError(failure);
      return;
    }
    setTitle('');
    setDetails('');
  }

  return (
    <Panel
      title="Assign work"
      description="Give another admin a task. It appears on their dashboard."
      delay={0.65}
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={targetFieldId} className="block text-sm font-medium text-steel-100">
              Assign to
            </label>
            <select
              id={targetFieldId}
              value={targetId}
              onChange={(event) => setTarget(event.target.value)}
              className={`${fieldClass} h-11`}
            >
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name} ({admin.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={titleFieldId} className="block text-sm font-medium text-steel-100">
              Task title
            </label>
            <input
              id={titleFieldId}
              required
              type="text"
              autoComplete="off"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Upload 15 trigonometry questions"
              className={`${fieldClass} h-11`}
            />
          </div>
        </div>

        <div>
          <label htmlFor={detailsFieldId} className="block text-sm font-medium text-steel-100">
            Details
          </label>
          <textarea
            id={detailsFieldId}
            required
            rows={3}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="What should they do, and by when?"
            className={`${fieldClass} resize-y py-3 leading-relaxed`}
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="border-l-2 border-gold-400 bg-gold-400/5 px-3 py-2 text-sm text-gold-300"
          >
            <strong className="font-semibold">Could not assign the task.</strong> {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending || !targetId}
          className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-md bg-emerald-400 px-6 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Assigning…' : 'Assign task'}
        </button>
      </form>
    </Panel>
  );
}