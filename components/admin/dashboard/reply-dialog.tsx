'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CloseIcon } from './icons';
import { formatStamp } from './format';
import { isDone, StatusBadge } from './status-badge';
import type { QueryItem } from './types';

interface ReplyDialogProps {
  query: QueryItem;
  /** Called once the dialog has closed, however it was closed. */
  onClose: () => void;
  /** Resolves to an error message, or null when the reply was saved. */
  onSend: (queryId: string, text: string) => Promise<string | null>;
}

/**
 * Uses the native <dialog> element. showModal() gives a real focus trap, Escape to close,
 * an inert page behind it, and returns focus to the button that opened it.
 */
export function ReplyDialog({ query, onClose, onSend }: ReplyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const fieldId = useId();
  const answered = isDone(query.status);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    fieldRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reply = text.trim();
    if (!reply || sending) return;

    setSending(true);
    setError(null);
    const failure = await onSend(query.id, reply);
    setSending(false);

    if (failure) {
      setError(failure);
      return;
    }
    close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-xl bg-transparent p-0 text-steel-100 backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="brackets border border-steel-700 bg-navy-900 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-steel-700/60 px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {answered ? 'Query and reply' : 'Reply to cadet'}
            </h2>
            <p className="mt-1 break-words text-sm font-medium text-steel-100">
              {query.student_name}
            </p>
            <p className="break-all text-sm text-steel-300">{query.student_email}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close dialog"
            className="-mr-2 -mt-1 grid size-10 shrink-0 touch-manipulation place-items-center rounded-md text-steel-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-steel-300">
              Received{' '}
              <time dateTime={query.created_at} className="tabular-nums text-steel-100">
                {formatStamp(query.created_at)}
              </time>
            </p>
            <StatusBadge status={query.status} />
          </div>

          <p className="whitespace-pre-line rounded-md border border-steel-700/60 bg-navy-950 p-4 leading-relaxed text-steel-100">
            {query.query_text}
          </p>

          {answered ? (
            <div className="border-l-2 border-emerald-400/60 pl-4">
              <p className="text-sm font-semibold text-emerald-300">Your reply</p>
              <p className="mt-1 whitespace-pre-line leading-relaxed text-steel-100">
                {query.admin_response || 'No reply text was recorded.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor={fieldId} className="block text-sm font-medium text-steel-100">
                  Your reply
                </label>
                <textarea
                  ref={fieldRef}
                  id={fieldId}
                  name="reply"
                  rows={5}
                  required
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Write a short answer the cadet can act on…"
                  className="mt-2 w-full resize-y rounded-md border border-steel-700 bg-navy-950 p-3 text-base leading-relaxed text-white placeholder:text-steel-300/70 focus-visible:border-emerald-400 sm:text-sm"
                />
              </div>

              {query.preview ? (
                <p className="border-l-2 border-gold-400 bg-gold-400/5 px-3 py-2 text-sm text-gold-300">
                  This is a sample query. Your reply is shown on this screen only and is not saved.
                </p>
              ) : null}

              {error ? (
                <p
                  role="alert"
                  className="border-l-2 border-gold-400 bg-gold-400/5 px-3 py-2 text-sm text-gold-300"
                >
                  <strong className="font-semibold">Could not send the reply.</strong> {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-md border border-steel-700 px-5 text-sm font-medium text-steel-100 transition-colors hover:border-steel-500 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || text.trim() === ''}
                  className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-md bg-emerald-400 px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </dialog>
  );
}