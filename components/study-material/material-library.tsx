"use client";

import { useBackToClose, useStepState } from "@/hooks/use-step-state";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PictureLibrary } from "@/components/flashcards/picture-library";
import { BackButton, ChapterThumb, plural, SubjectFolderCard } from "@/components/vault/folder-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { PdfViewer } from "@/components/ui/pdf-viewer";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { resourceKind, VAULTS } from "@/lib/resources";
import { EXAMS } from "@/lib/subjects";
import { subjectCoverUrl } from "@/components/flashcards/picture-url";
import { supabase } from "@/lib/supabaseClient";
import { ExamSyllabusPanel } from "@/components/study-material/exam-syllabus-panel";
import { buildFolders, itemInExam, subjectInExam } from "@/lib/taxonomy";

interface Material {
  id: string;
  title: string;
  description: string | null;
  size: string | null;
  download_url: string;
  file_type: string | null;
  downloads: number;
  vault: string;
  subject_id: string | null;
  chapter_id: string | null;
  exams: string[];
  category: string | null;
  recommended_for: string | null;
  cover_path?: string | null;
}

const COLUMNS = "id, title, description, category, size, recommended_for, download_url, file_type, downloads, vault, subject_id, chapter_id, exams, cover_path";
const LOOSE = "loose";

type VaultKey = (typeof VAULTS)[number]["id"] | "flashcards";

/** The four vaults, always shown, in the order students see them. */
const VAULT_LIST: { id: VaultKey; label: string; blurb: string; Icon: (typeof Icons)[keyof typeof Icons] }[] = [
  { id: "notes", label: "PDF Notes", blurb: "Chapter notes to read and revise", Icon: Icons.book },
  { id: "flashcards", label: "Flashcards", blurb: "Quick-recall pictures by chapter", Icon: Icons.component },
  { id: "formulas", label: "Formulas", blurb: "Formula sheets and key facts", Icon: Icons.sigma },
  { id: "questions", label: "Questions PDF", blurb: "Practice sets and papers", Icon: Icons.clipboardCheck },
];

function isVault(value: string | null): value is VaultKey {
  return VAULT_LIST.some((v) => v.id === value);
}

function FileCard({ m, shown, onDownload, onView }: { m: Material; shown: number; onDownload: () => void; onView: () => void }) {
  const kind = resourceKind(m);
  const usable = Boolean(m.download_url) && m.download_url !== "#";
  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      {m.cover_path ? (
        <div className="aspect-video w-full bg-navy-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={subjectCoverUrl(m.cover_path)} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      ) : null}
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={kind === "pdf" ? "gold" : "emerald"}>{kind === "pdf" ? "PDF" : "Image"}</Badge>
          {m.exams.length > 0 ? <Badge variant="outline">{m.exams.join(", ").toUpperCase()}</Badge> : null}
        </div>
        <CardTitle className="text-lg">{m.title}</CardTitle>
        {m.description ? <p className="text-sm text-steel-300">{m.description}</p> : null}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3 border-t border-steel-700/60 pt-4">
          <span className="font-mono text-xs text-steel-300">
            {m.size ? `${m.size} · ` : ""}
            <span className="tabular-nums">{shown}</span> {shown === 1 ? "download" : "downloads"}
          </span>
          {usable ? (
            <div className="flex flex-wrap justify-end gap-2">
              {kind === "pdf" ? (
                <Button variant="secondary" size="sm" onClick={onView}>
                  <Icons.eye className="size-4" aria-hidden />
                  View<span className="sr-only"> {m.title}</span>
                </Button>
              ) : null}
              <Button asChild variant="primary" size="sm">
                <a href={m.download_url} target="_blank" rel="noopener noreferrer" onClick={onDownload}>
                  <Icons.download className="size-4" />
                  Download<span className="sr-only"> {m.title} (opens in a new tab)</span>
                </a>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Unavailable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * The student Study Material page: four vaults (PDF Notes, Flashcards, Formulas, Questions PDF), each holding
 * subject folders, then chapters, then files that download one at a time. An exam filter narrows everything.
 * Open to everyone, signed in or not. `?vault=` and `?exam=` in the address open a vault or exam directly.
 */
interface LibraryView {
  vault: VaultKey | null;
  subjectId: string | null;
  chapter: string | null;
}

export function MaterialLibrary() {
  const params = useSearchParams();
  const startVault = params.get("vault");
  const startExam = params.get("exam");

  const [items, setItems] = React.useState<Material[] | null>(null);
  const [pictureTags, setPictureTags] = React.useState<{ subject_id: string | null; exams: string[] }[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [exam, setExam] = React.useState<string | null>(EXAMS.some((e) => e.id === startExam) ? startExam : null);
  const [view, pushView, upView] = useStepState<LibraryView>({ vault: isVault(startVault) ? startVault : null, subjectId: null, chapter: null }, "library");
  const { vault, subjectId, chapter } = view;
  const [search, setSearch] = React.useState("");
  const [viewing, setViewing] = React.useState<Material | null>(null);
  const [counted, setCounted] = React.useState<ReadonlySet<string>>(new Set());
  const taxonomy = useTaxonomy();
  useBackToClose(viewing !== null, () => setViewing(null));

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("resources").select(COLUMNS).order("created_at", { ascending: true }),
      supabase.from("flashcard_images").select("subject_id, exams"),
    ]).then(([res, pics]) => {
      if (!active) return;
      if (res.error) {
        setError(res.error.message);
        setItems([]);
      } else {
        setItems(((res.data ?? []) as unknown as Material[]).map((m) => ({ ...m, exams: m.exams ?? [] })));
      }
      setPictureTags(pics.error ? [] : ((pics.data ?? []) as { subject_id: string | null; exams: string[] }[]));
    });
    return () => {
      active = false;
    };
  }, []);

  const go = React.useCallback(
    (v: VaultKey | null, s: string | null = null, c: string | null = null) => {
      pushView({ vault: v, subjectId: s, chapter: c });
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [pushView],
  );
  const up = React.useCallback(
    (v: VaultKey | null, s: string | null = null, c: string | null = null) => {
      upView({ vault: v, subjectId: s, chapter: c });
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [upView],
  );

  // Files that sit in a subject belong to a vault. The older official links have no subject and get their own section.
  const filed = React.useMemo(() => (items ?? []).filter((m) => m.subject_id && itemInExam(m.exams, exam)), [items, exam]);
  const official = React.useMemo(() => (items ?? []).filter((m) => !m.subject_id), [items]);
  const flashcardCount = React.useMemo(() => pictureTags.filter((p) => itemInExam(p.exams, exam)).length, [pictureTags, exam]);

  const countFor = (id: VaultKey) => (id === "flashcards" ? flashcardCount : filed.filter((m) => m.vault === id).length);

  const countDownload = (id: string) => {
    if (counted.has(id)) return;
    setCounted((prev) => new Set(prev).add(id));
    // Supabase only sends the request once the call is awaited or chained with then. The counter is a convenience.
    supabase.rpc("increment_resource_downloads", { p_resource_id: id }).then(() => undefined);
  };
  const shownDownloads = (m: Material) => m.downloads + (counted.has(m.id) ? 1 : 0);

  const q = search.trim().toLowerCase();
  const searchHits = React.useMemo(
    () => (q ? filed.filter((m) => [m.title, m.description].some((f) => f?.toLowerCase().includes(q))) : []),
    [filed, q],
  );

  if (items === null || taxonomy.loading) {
    return (
      <SkeletonGroup label="Loading study material" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-panel" />
        ))}
      </SkeletonGroup>
    );
  }

  const examChips = (
    <div role="group" aria-label="Filter by exam" className="flex flex-wrap gap-2">
      {[{ id: null as string | null, name: "All exams" }, ...EXAMS.map((e) => ({ id: e.id as string | null, name: e.name }))].map((chip) => (
        <Button key={chip.name} size="sm" variant={exam === chip.id ? "primary" : "outline"} aria-pressed={exam === chip.id} onClick={() => setExam(chip.id)}>
          {chip.name}
        </Button>
      ))}
    </div>
  );
  const errorBox = error ? (
    <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
      Study material could not be loaded: {error}
    </p>
  ) : null;
  const vaultInfo = VAULT_LIST.find((v) => v.id === vault);

  const content = (() => {
  // Inside a vault.
  if (vault && vaultInfo) {
    if (vault === "flashcards") {
      return (
        <div className="space-y-6">
          {errorBox}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton label="All vaults" onClick={() => up(null)} />
              <h2 className="text-xl font-bold tracking-tight text-white">{vaultInfo.label}</h2>
            </div>
            {examChips}
          </div>
          <ExamSyllabusPanel exam={exam} />
          <PictureLibrary exam={exam} showRecent={false} />
        </div>
      );
    }

    const inVault = filed.filter((m) => m.vault === vault);
    const folders = buildFolders(inVault, taxonomy.subjects, taxonomy.chapters).filter(
      (f) => (f.count > 0 || f.subject.name !== "Unsorted") && subjectInExam(f.subject, items.filter((m) => m.vault === vault), exam),
    );
    const folder = subjectId ? folders.find((f) => f.subject.id === subjectId) : undefined;

    // A chapter: its files.
    if (folder && chapter) {
      const isLoose = chapter === LOOSE;
      const chapterName = isLoose ? "General" : (folder.chapters.find((c) => c.id === chapter)?.name ?? "Chapter");
      const files = inVault.filter((m) => m.subject_id === folder.subject.id && (isLoose ? !folder.chapters.some((c) => c.id === m.chapter_id) : m.chapter_id === chapter));
      return (
        <div className="space-y-6">
          {errorBox}
          <div className="flex flex-wrap items-center gap-3">
            <BackButton label={folder.subject.name} onClick={() => up(vault, folder.subject.id, null)} />
            <h2 className="text-xl font-bold tracking-tight text-white">
              {vaultInfo.label} <span className="text-steel-500">/</span> {folder.subject.name} <span className="text-steel-500">/</span> {chapterName}
            </h2>
          </div>
          {files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-bold text-white">No files in this chapter yet</p>
                <p className="mt-2 text-sm text-steel-300">They show up here as soon as they are uploaded.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {files.map((m) => (
                <FileCard key={m.id} m={m} shown={shownDownloads(m)} onDownload={() => countDownload(m.id)} onView={() => setViewing(m)} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // A subject: its chapters.
    if (folder) {
      const rows = [...(folder.looseCount > 0 ? [{ id: LOOSE, name: "General", count: folder.looseCount }] : []), ...folder.chapters];
      return (
        <div className="space-y-6">
          {errorBox}
          <div className="flex flex-wrap items-center gap-3">
            <BackButton label={vaultInfo.label} onClick={() => up(vault)} />
            <h2 className="text-xl font-bold tracking-tight text-white">
              {vaultInfo.label} <span className="text-steel-500">/</span> {folder.subject.name}
            </h2>
          </div>
          {rows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-bold text-white">No chapters yet</p>
                <p className="mt-2 text-sm text-steel-300">Chapters for {folder.subject.name} will appear here once they are added.</p>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid list-none gap-3 p-0 md:grid-cols-2">
              {rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => {
                      // A chapter with one PDF opens that PDF straight away. Close returns here.
                      const only = inVault.filter((m) => m.subject_id === folder.subject.id && (row.id === LOOSE ? !folder.chapters.some((c) => c.id === m.chapter_id) : m.chapter_id === row.id));
                      if (only.length === 1 && resourceKind(only[0]) === "pdf" && only[0].download_url && only[0].download_url !== "#") setViewing(only[0]);
                      else go(vault, folder.subject.id, row.id);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-panel border border-steel-700/60 bg-navy-900 px-4 py-3 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <ChapterThumb path={"cover_path" in row ? row.cover_path : null} />
                      <span className="min-w-0 truncate text-sm font-semibold text-white">{row.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-mono text-xs text-steel-300">
                      {row.count === 0 ? "Empty" : plural(row.count, "file")}
                      <Icons.chevronRight className="size-4" aria-hidden />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    // A vault: its subject folders.
    return (
      <div className="space-y-6">
        {errorBox}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton label="All vaults" onClick={() => up(null)} />
            <h2 className="text-xl font-bold tracking-tight text-white">{vaultInfo.label}</h2>
          </div>
          {examChips}
        </div>
        <ExamSyllabusPanel exam={exam} />
        {folders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-bold text-white">No subjects yet</p>
              <p className="mt-2 text-sm text-steel-300">Subjects show up here as soon as they are added.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {folders.map((f) => (
              <SubjectFolderCard key={f.subject.id} folder={f} unit="file" onOpen={() => go(vault, f.subject.id, null)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // The top: exam filter, search, the four vaults, then the official links.
  return (
    <div className="space-y-10">
      {errorBox}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <label htmlFor="material-search" className="sr-only">
            Search study material
          </label>
          <Input id="material-search" type="search" placeholder="Search files by title..." value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
        </div>
        {examChips}
      </div>

      <ExamSyllabusPanel exam={exam} />

      {q ? (
        <section aria-label="Search results" className="space-y-4">
          <p role="status" className="text-xs tabular-nums text-steel-300">
            {searchHits.length} {searchHits.length === 1 ? "file" : "files"} match
          </p>
          {searchHits.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-steel-300">Nothing matches that search. Try a different word, or clear it to browse the vaults.</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchHits.map((m) => (
                <FileCard key={m.id} m={m} shown={shownDownloads(m)} onDownload={() => countDownload(m.id)} onView={() => setViewing(m)} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Vaults" className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white">Vaults</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VAULT_LIST.map(({ id, label, blurb, Icon }) => {
              const count = countFor(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  className="group flex flex-col gap-3 rounded-panel border border-steel-700/60 bg-navy-900 p-5 text-left transition-colors hover:border-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                >
                  <Icon className="size-8 text-gold-400" aria-hidden />
                  <div>
                    <p className="text-lg font-bold text-white group-hover:text-gold-300">{label}</p>
                    <p className="mt-1 text-xs text-steel-300">{blurb}</p>
                  </div>
                  <p className="font-mono text-xs text-steel-300">{count === 0 ? "Empty" : plural(count, id === "flashcards" ? "card" : "file")}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {official.length > 0 && !q ? (
        <section aria-label="Official links" className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white">Official links</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {official.map((m) => (
              <FileCard key={m.id} m={m} shown={shownDownloads(m)} onDownload={() => countDownload(m.id)} onView={() => setViewing(m)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
  })();

  return (
    <>
      {content}
      {viewing ? <PdfViewer url={viewing.download_url} title={viewing.title} onClose={() => setViewing(null)} onDownload={() => countDownload(viewing.id)} /> : null}
    </>
  );
}
