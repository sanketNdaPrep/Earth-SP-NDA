'use client';

import { useState } from 'react';
import { formatStamp } from './format';
import { Panel } from './panel';
import { isDone, StatusBadge } from './status-badge';
import type { QueryItem } from './types';

type Filter = 'all' | 'pending' | 'resolved';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'resolved', label: 'Resolved' },
];

const replyButton =
  'inline-flex min-h-10 touch-manipulation items-center justify-center rounded-md border px-4 text-sm font-semibold transition-colors';

function ActionButton({ query, onOpen }: { query: QueryItem; onOpen: (query: QueryItem) => void }) {
  const done = isDone(query.status);
  return (
    <button
      type="button"
      onClick={() => onOpen(query)}
      className={`${replyButton} ${
        done
          ? 'border-steel-700 text-steel-100 hover:border-steel-500 hover:bg-white/5'
          : 'border-emerald-400/60 text-emerald-300 hover:bg-emerald-400/10'
      }`}
    >
      {done ? 'View' : 'Reply'}
      <span className="sr-only">
        {done ? ` query from ${query.student_name}` : ` to ${query.student_name}`}
      </span>
    </button>
  );
}

export function QueriesPanel({
  queries,
  showingSamples,
  onOpen,
}: {
  queries: QueryItem[];
  showingSamples: boolean;
  onOpen: (query: QueryItem) => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const pending = queries.filter((query) => !isDone(query.status)).length;
  const counts: Record<Filter, number> = {
    all: queries.length,
    pending,
    resolved: queries.length - pending,
  };
  const rows = queries.filter(
    (query) =>
      filter === 'all' || (filter === 'pending' ? !isDone(query.status) : isDone(query.status)),
  );

  const filters = (
    <div role="group" aria-label="Filter queries by status" className="flex flex-wrap gap-1.5">
      {FILTERS.map((item) => {
        const active = filter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => setFilter(item.id)}
            className={`min-h-9 touch-manipulation rounded-md border px-3 text-sm font-medium transition-colors ${
              active
                ? 'border-emerald-400 bg-emerald-400 text-navy-950'
                : 'border-steel-700 text-steel-100 hover:border-steel-500 hover:bg-white/5'
            }`}
          >
            {item.label} <span className="tabular-nums opacity-80">{counts[item.id]}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <Panel
      title="Recent student queries"
      description="Newest first. Open a query to read it in full and reply."
      action={filters}
      delay={0.35}
    >
      {showingSamples ? (
        <p className="border-b border-gold-400/30 bg-gold-400/5 px-5 py-2.5 text-sm text-gold-300 sm:px-6">
          Sample queries are shown because the queries table is empty. Replies to them are not saved.
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-sm text-steel-300 sm:px-6">
          {queries.length === 0
            ? 'No student queries yet. Questions from cadets will appear here.'
            : `No ${filter} queries right now.`}
        </p>
      ) : (
        <div className="md:max-h-[34rem] md:overflow-auto">
          <table className="hidden w-full border-separate border-spacing-0 text-left md:table">
            <caption className="sr-only">Recent student queries</caption>
            <thead className="sticky top-0 z-10 bg-navy-900">
              <tr className="text-xs font-medium text-steel-300">
                <th scope="col" className="border-b border-steel-700/60 px-6 py-3 font-medium">
                  Cadet
                </th>
                <th scope="col" className="border-b border-steel-700/60 px-3 py-3 font-medium">
                  Query
                </th>
                <th scope="col" className="border-b border-steel-700/60 px-3 py-3 font-medium">
                  Status and time
                </th>
                <th scope="col" className="border-b border-steel-700/60 px-6 py-3 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((query) => (
                <tr key={query.id} className="transition-colors hover:bg-white/5">
                  <td className="w-56 border-b border-steel-700/40 py-4 pl-6 pr-2 align-top">
                    <p className="break-words font-medium text-white">{query.student_name}</p>
                    <p className="break-words text-xs text-steel-300">{query.student_email}</p>
                  </td>
                  <td className="border-b border-steel-700/40 px-3 py-4 align-top">
                    <p className="line-clamp-3 leading-relaxed text-steel-100">
                      {query.query_text}
                    </p>
                  </td>
                  <td className="w-36 whitespace-nowrap border-b border-steel-700/40 px-3 py-4 align-top">
                    <StatusBadge status={query.status} />
                    <p className="mt-2 text-xs tabular-nums text-steel-300">
                      <span className="sr-only">Received </span>
                      <time dateTime={query.created_at}>{formatStamp(query.created_at)}</time>
                    </p>
                  </td>
                  <td className="border-b border-steel-700/40 px-6 py-4 text-right align-top">
                    <ActionButton query={query} onOpen={onOpen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="md:hidden">
            {rows.map((query) => (
              <li key={query.id} className="border-b border-steel-700/40 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-white">{query.student_name}</p>
                    <p className="break-all text-xs text-steel-300">{query.student_email}</p>
                  </div>
                  <StatusBadge status={query.status} />
                </div>
                <p className="mt-3 line-clamp-3 leading-relaxed text-steel-100">{query.query_text}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <time
                    dateTime={query.created_at}
                    className="text-xs tabular-nums text-steel-300"
                  >
                    {formatStamp(query.created_at)}
                  </time>
                  <ActionButton query={query} onOpen={onOpen} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}