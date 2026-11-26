"use client";

import * as React from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { DEFAULT_ZOOM, pageAtOffset, pageHeightFor, pdfFileName, stepZoom } from "@/lib/pdf-view";

const GAP = 12;
/** Pages this far (in pixels) beyond the screen are drawn, so scrolling never shows a blank page. */
const AHEAD = 900;

export interface PdfViewerProps {
  /** Public address of the PDF. */
  url: string;
  /** Shown in the top bar and used for the downloaded file's name. */
  title: string;
  onClose: () => void;
  /** Called after a download starts, so the caller can count it. */
  onDownload?: () => void;
  /** Extra buttons in the top bar, for example "Image view". */
  extra?: React.ReactNode;
  className?: string;
}

type PageSize = { w: number; h: number };

/**
 * Reads a PDF on the page, like a file viewer: scroll through the pages, zoom, jump position shown, download.
 * pdf.js is loaded only when this opens. Works on phones, where the browser's own PDF viewer often just downloads.
 */
export function PdfViewer({ url, title, onClose, onDownload, extra, className }: PdfViewerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [doc, setDoc] = React.useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = React.useState<PageSize[]>([]);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(DEFAULT_ZOOM);
  const [boxWidth, setBoxWidth] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [saveFailed, setSaveFailed] = React.useState(false);

  // Open the PDF.
  React.useEffect(() => {
    let cancelled = false;
    let task: { destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const loading = pdfjs.getDocument({ url });
        task = loading;
        const loaded = await loading.promise;
        if (cancelled) return;
        // Sizes of all pages up front, so the scroll bar is right and pages do not jump as they appear.
        const found: PageSize[] = [];
        for (let n = 1; n <= loaded.numPages; n += 1) {
          const p = await loaded.getPage(n);
          const v = p.getViewport({ scale: 1 });
          found.push({ w: v.width, h: v.height });
          p.cleanup();
          if (cancelled) return;
        }
        setSizes(found);
        setDoc(loaded);
      } catch (error) {
        if (cancelled) return;
        const name = (error as { name?: string })?.name;
        setProblem(name === "PasswordException" ? "This PDF is locked with a password." : "This PDF could not be shown here.");
      }
    })();
    return () => {
      cancelled = true;
      if (task) void task.destroy();
    };
  }, [url]);

  // Width available for a page.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setBoxWidth(Math.max(0, el.clientWidth - 24));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [doc]);

  const pageWidth = Math.round(boxWidth * zoom);
  const heights = React.useMemo(() => sizes.map((s) => pageHeightFor(pageWidth, s.w, s.h)), [sizes, pageWidth]);

  // Page counter.
  const onScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el || heights.length === 0) return;
    setPage(pageAtOffset(el.scrollTop + el.clientHeight / 3, heights, GAP));
  }, [heights]);

  // Lock the page behind, close with Esc, zoom with + and -.
  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => stepZoom(z, 1));
      if (e.key === "-") setZoom((z) => stepZoom(z, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [onClose]);

  const download = async () => {
    setSaving(true);
    setSaveFailed(false);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = pdfFileName(title);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
      onDownload?.();
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  const total = sizes.length;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className={cn("fixed inset-0 z-50 flex flex-col bg-navy-950", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-steel-700/60 bg-navy-900 px-3 py-2.5 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="font-mono text-xs text-steel-300" aria-live="polite">
            {total > 0 ? `Page ${page} of ${total}` : problem ? "Not available" : "Opening..."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1" role="group" aria-label="Zoom">
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => stepZoom(z, -1))} aria-label="Zoom out" disabled={!doc}>
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M5 12h14" />
              </svg>
            </Button>
            <span className="w-12 text-center font-mono text-xs text-steel-300">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => stepZoom(z, 1))} aria-label="Zoom in" disabled={!doc}>
              <Icons.plus className="size-4" aria-hidden />
            </Button>
          </div>
          {extra}
          <Button variant="primary" size="sm" onClick={() => void download()} loading={saving} disabled={saving}>
            <Icons.download className="size-4" aria-hidden />
            Download
          </Button>
          <Button ref={closeRef} variant="outline" size="sm" onClick={onClose} aria-label="Close PDF">
            <Icons.close className="size-4" aria-hidden />
            Close
          </Button>
        </div>
      </div>

      {saveFailed ? (
        <p role="alert" className="border-b border-danger-500/40 bg-danger-500/10 px-4 py-2 text-xs font-semibold text-danger-400">
          The download did not work. Check your connection and try again.
        </p>
      ) : null}

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto bg-navy-950 px-3 py-3" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
        {problem ? (
          <div className="mx-auto mt-16 max-w-sm space-y-4 text-center">
            <p className="text-base font-bold text-white">{problem}</p>
            <p className="text-sm text-steel-300">You can still download it or open it in a new tab.</p>
            <div className="flex justify-center gap-2">
              <Button variant="primary" size="sm" onClick={() => void download()}>
                <Icons.download className="size-4" aria-hidden />
                Download
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Open in a new tab
                </a>
              </Button>
            </div>
          </div>
        ) : !doc ? (
          <div className="mt-24 flex items-center justify-center gap-3 text-sm text-steel-300" role="status">
            <Icons.spinner className="size-5 animate-spin" />
            Opening the PDF...
          </div>
        ) : (
          <div className="mx-auto flex w-max min-w-full flex-col items-center" style={{ gap: GAP }}>
            {sizes.map((s, i) => (
              <PdfPage key={i} doc={doc} number={i + 1} width={pageWidth} height={heights[i]} pdfWidth={s.w} root={scrollRef} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** One page. It is drawn when it comes near the screen and released when it is far away. */
function PdfPage({ doc, number, width, height, pdfWidth, root }: { doc: PDFDocumentProxy; number: number; width: number; height: number; pdfWidth: number; root: React.RefObject<HTMLDivElement | null> }) {
  const holder = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [near, setNear] = React.useState(number <= 2);

  React.useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { root: root.current, rootMargin: `${AHEAD}px 0px ${AHEAD}px 0px` });
    observer.observe(el);
    return () => observer.disconnect();
  }, [root]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!near || width <= 0) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      try {
        const p = await doc.getPage(number);
        if (cancelled) return;
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const viewport = p.getViewport({ scale: (width / pdfWidth) * ratio });
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        task = p.render({ canvas, canvasContext: ctx, viewport });
        await task.promise;
        p.cleanup();
      } catch {
        // A cancelled draw (scrolled away or zoomed) is normal.
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, number, near, width, pdfWidth]);

  return (
    <div ref={holder} className="shrink-0 bg-white shadow-panel" style={{ width, height }} data-page={number}>
      <canvas ref={canvasRef} className="block size-full" aria-label={`Page ${number}`} />
    </div>
  );
}
