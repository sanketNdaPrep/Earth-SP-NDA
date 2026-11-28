"use client";

import * as React from "react";
import { Icons } from "@/components/ui/icons";
import { fileMatchesAccept, formatFileSize } from "@/lib/file-accept";
import { cn } from "@/lib/utils";

export interface UploadDropzoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "title"> {
  /** Main line, for example "Drop file here or". The word "browse" is added after it. */
  title?: string;
  /** Small line under it: what is allowed, for example "PDF, DOCX, PPTX up to 50 MB". */
  hint?: string;
  /** A one-row version for lists and forms that already have many fields. */
  compact?: boolean;
  /** Overrides the file name shown. Use null to show nothing, for example after the parent resets the form. */
  fileName?: string | null;
  /** Shows a Remove button next to the chosen file and calls this when it is pressed. */
  onClear?: () => void;
  className?: string;
}

/**
 * A drop zone around a real file input. The input keeps working exactly as before (same onChange, same event),
 * so a parent only swaps `<input type="file">` for this component. Dropping a file fills the input and fires onChange.
 */
export const UploadDropzone = React.forwardRef<HTMLInputElement, UploadDropzoneProps>(function UploadDropzone(
  { title = "Drop file here or", hint, compact = false, fileName, onClear, className, onChange, disabled, accept, multiple, ...inputProps },
  forwardedRef,
) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [over, setOver] = React.useState(false);
  const [picked, setPicked] = React.useState<{ name: string; size: number } | null>(null);
  const [problem, setProblem] = React.useState<string | null>(null);

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setProblem(null);
    setPicked(f ? { name: f.name, size: f.size } : null);
    onChange?.(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setOver(false);
    const input = inputRef.current;
    if (!input || disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length === 0) return;
    const allowed = dropped.filter((f) => fileMatchesAccept(f, accept));
    if (allowed.length === 0) {
      setProblem("That file type is not allowed here.");
      return;
    }
    const transfer = new DataTransfer();
    (multiple ? allowed : allowed.slice(0, 1)).forEach((f) => transfer.items.add(f));
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPicked(null);
    setProblem(null);
    onClear?.();
  };

  const shownName = fileName === undefined ? picked?.name : fileName;
  const shownSize = fileName === undefined && picked ? formatFileSize(picked.size) : null;

  return (
    <div className={className}>
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex cursor-pointer border-2 border-dashed border-steel-700 bg-navy-950 transition-colors duration-(--duration-base)",
          "hover:border-gold-400/70 has-[:focus-visible]:border-gold-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-300 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-navy-950",
          over && "border-gold-400 bg-gold-400/10",
          disabled && "cursor-not-allowed opacity-50",
          compact ? "items-center gap-3 rounded-panel px-3 py-2.5" : "flex-col items-center justify-center gap-4 rounded-card px-6 py-10 text-center",
        )}
      >
        <input
          ref={setRefs}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
          {...inputProps}
        />
        <span
          aria-hidden="true"
          className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-400", compact ? "size-9" : "size-16")}
        >
          <Icons.upload className={compact ? "size-5" : "size-8"} />
        </span>
        <span className={cn("min-w-0", compact ? "flex-1 text-left" : "space-y-1")}>
          <span className={cn("block font-semibold text-white", compact ? "text-sm" : "text-base")}>
            {title} <span className="text-gold-300 underline underline-offset-4">browse</span>
          </span>
          {hint ? <span className={cn("block font-mono text-steel-500", "text-xs")}>{hint}</span> : null}
        </span>
      </label>

      {shownName ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control bg-navy-800 px-3 py-2 text-sm text-steel-100">
          <Icons.fileText className="size-4 shrink-0 text-gold-300" />
          <span className="min-w-0 break-all font-semibold">{shownName}</span>
          {shownSize ? <span className="text-xs text-steel-500">{shownSize}</span> : null}
          {onClear ? (
            <button
              type="button"
              onClick={clear}
              className="ml-auto text-xs font-semibold text-danger-400 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
            >
              Remove
            </button>
          ) : null}
        </p>
      ) : null}
      {problem ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger-400">
          {problem}
        </p>
      ) : null}
    </div>
  );
});
