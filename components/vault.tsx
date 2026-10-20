'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DRIVE_FOLDERS } from '@/lib/landing-content';
import { useLandingData, type ResourcePdf } from './landing-data';
import { CheckIcon, DownloadIcon, ExternalIcon, SearchIcon } from './icons';

const ALL = 'All';

function matches(file: ResourcePdf, query: string) {
  if (!query) return true;
  const haystack = `${file.title} ${file.category} ${file.recommended_for ?? ''}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function SkeletonCards() {
  return (
    <ul aria-hidden="true" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((key) => (
        <li key={key} className="h-48 animate-pulse rounded-md border border-steel-700/60 bg-navy-900" />
      ))}
    </ul>
  );
}

function DriveFallback() {
  return (
    <>
      <p className="mt-8 text-sm text-steel-300">
        The searchable library is empty right now. These notes are hosted on Google Drive.
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DRIVE_FOLDERS.map((folder) => (
          <li key={folder.title}>
            <a
              href={folder.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col justify-between rounded-md border border-steel-700 bg-navy-900 p-5 transition-colors hover:border-emerald-400/60"
            >
              <span>
                <span className="block text-lg font-semibold leading-snug text-white">
                  {folder.title}
                </span>
                <span className="mt-2 block text-sm text-steel-300">{folder.description}</span>
              </span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                Open in Google Drive
                <ExternalIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export function Vault() {
  const { resources, resourcesState, downloadedFiles, notice, handleDownload } = useLandingData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(resources.map((file) => file.category).filter(Boolean)))],
    [resources],
  );

  const visible = useMemo(
    () =>
      resources.filter(
        (file) => (category === ALL || file.category === category) && matches(file, query.trim()),
      ),
    [resources, category, query],
  );

  const hasFilters = query.trim() !== '' || category !== ALL;

  return (
    <section id="vault" aria-labelledby="vault-title" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2
          id="vault-title"
          className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Study notes and planners
        </h2>
        <p className="mt-3 max-w-[60ch] text-steel-300">
          Free PDFs for revision. Search by title or exam, or filter by type.
        </p>

        {resourcesState === 'loading' && <SkeletonCards />}

        {resourcesState === 'ready' && resources.length === 0 && <DriveFallback />}

        {resourcesState === 'ready' && resources.length > 0 && (
          <>
            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <label htmlFor="vault-search" className="sr-only">
                  Search notes and planners
                </label>
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-steel-300" />
                <input
                  id="vault-search"
                  type="search"
                  name="q"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Search by title or exam…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 w-full rounded-md border border-steel-700 bg-navy-900 pl-10 pr-3 text-base text-white placeholder:text-steel-300/70 focus-visible:border-emerald-400 sm:text-sm"
                />
              </div>

              <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
                {categories.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                    className={`min-h-10 touch-manipulation rounded-md border px-3.5 text-sm font-medium transition-colors ${
                      category === name
                        ? 'border-emerald-400 bg-emerald-400 text-navy-950'
                        : 'border-steel-700 text-steel-100 hover:border-steel-500 hover:bg-white/5'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <p role="status" className="mt-5 text-sm tabular-nums text-steel-300">
              {visible.length} {visible.length === 1 ? 'file' : 'files'}
            </p>

            {visible.length > 0 ? (
              <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((file) => {
                  const opened = downloadedFiles.includes(file.title);
                  return (
                    <motion.li
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col justify-between rounded-md border border-steel-700 bg-navy-900 p-5 transition-colors hover:border-emerald-400/50"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-sm bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                            {file.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-steel-300">
                            <DownloadIcon className="size-3.5" />
                            <span className="sr-only">Downloads:</span>
                            {file.downloads ?? 0}
                          </span>
                        </div>
                        <h3 className="mt-4 text-pretty text-lg font-semibold leading-snug text-white">
                          {file.title}
                        </h3>
                        {file.recommended_for ? (
                          <p className="mt-2 text-sm text-steel-300">
                            Recommended for {file.recommended_for}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-steel-700/70 pt-4">
                        <span className="font-mono text-xs text-steel-300">
                          PDF{file.size ? ` · ${file.size}` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDownload(file)}
                          aria-label={`Download ${file.title}`}
                          className="inline-flex min-h-10 touch-manipulation items-center gap-2 rounded-md bg-emerald-400 px-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-emerald-300"
                        >
                          {opened ? (
                            <CheckIcon className="size-4" />
                          ) : (
                            <DownloadIcon className="size-4" />
                          )}
                          {opened ? 'Opened' : 'Download'}
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-3 rounded-md border border-dashed border-steel-700 px-5 py-10 text-center">
                <p className="text-steel-100">No files match your search.</p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setCategory(ALL);
                    }}
                    className="mt-3 min-h-10 touch-manipulation text-sm font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <aside className="mt-10 border-l-2 border-gold-400 bg-gold-400/5 px-4 py-3 text-sm leading-relaxed text-steel-100">
          <p className="max-w-[72ch]">
            <strong className="font-semibold text-gold-300">Use these as revision aids.</strong>{' '}
            They summarise topics and do not replace the official syllabus. Check dates, syllabus
            and eligibility on upsc.gov.in. I cannot promise selection.
          </p>
        </aside>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.p
            key="vault-notice"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-md border border-gold-400/50 bg-navy-800 px-4 py-3 text-sm text-steel-100 shadow-lg"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}