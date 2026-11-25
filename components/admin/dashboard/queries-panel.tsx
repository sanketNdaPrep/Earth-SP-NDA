'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { formatStamp } from './format';
import { Panel } from './panel';
import { isDone, StatusBadge } from './status-badge';
import type { QueryItem } from './types';
import { Table, TBody, Td, THead, Th, Tr } from "@/components/ui/data-table";

type Filter = 'all' | 'pending' | 'resolved';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'resolved', label: 'Resolved' },
];


function ActionButton({ query, onOpen }: { query: QueryItem; onOpen: (query: QueryItem) => void }) {
  const done = isDone(query.status);
  return (
    <Button type="button" variant={done ? 'secondary' : 'primary'} onClick={() => onOpen(query)} className="min-h-10 px-4">
      {done ? 'View' : 'Reply'}
      <span className="sr-only">
        {done ? ` query from ${query.student_name}` : ` to ${query.student_name}`}
      </span>
    </Button>
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
          <Table className="hidden min-w-0 md:table">
            <caption className="sr-only">Recent student queries</caption>
            <THead>
              <Tr className="even:bg-transparent hover:bg-transparent">
                <Th>
                  Cadet
                </Th>
                <Th>
                  Query
                </Th>
                <Th>
                  Status and time
                </Th>
                <Th className="text-right">
                  Action
                </Th>
              </Tr>
            </THead>
            <TBody>
              {rows.map((query) => (
                <Tr key={query.id}>
                  <Td className="w-56 align-top">
                    <p className="break-words font-medium text-white">{query.student_name}</p>
                    <p className="break-words text-xs text-steel-300">{query.student_email}</p>
                  </Td>
                  <Td className="align-top">
                    <p className="line-clamp-3 leading-relaxed text-steel-100">
                      {query.query_text}
                    </p>
                  </Td>
                  <Td className="w-36 whitespace-nowrap align-top">
                    <StatusBadge status={query.status} />
                    <p className="mt-2 text-xs tabular-nums text-steel-300">
                      <span className="sr-only">Received </span>
                      <time dateTime={query.created_at}>{formatStamp(query.created_at)}</time>
                    </p>
                  </Td>
                  <Td className="text-right align-top">
                    <ActionButton query={query} onOpen={onOpen} />
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

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