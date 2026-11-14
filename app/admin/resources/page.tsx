"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { logAdminAction } from "@/lib/adminLog";
import {
  ACCEPT_ATTRIBUTE,
  checkFile,
  formatSize,
  MAX_CATEGORY,
  MAX_DESCRIPTION,
  MAX_UPLOAD_BYTES,
  RESOURCE_BUCKET,
  RESOURCE_CATEGORIES,
  RESOURCE_COLUMNS,
  RESOURCE_EXAMS,
  resourceKind,
  storagePath,
  type StoredResource,
} from "@/lib/resources";
import { supabase } from "@/lib/supabaseClient";

type Message = { type: "success" | "error"; text: string } | null;

const textareaClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 " +
  "focus-visible:border-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/40";

export default function AdminResourcesPage() {
  const [rows, setRows] = React.useState<StoredResource[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState(RESOURCE_CATEGORIES[0]);
  const [exam, setExam] = React.useState(RESOURCE_EXAMS[0]);
  const [file, setFile] = React.useState<File | null>(null);
  const [fileKey, setFileKey] = React.useState(0); // changing this clears the file picker
  const [uploading, setUploading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("resources")
      .select(RESOURCE_COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadError(error.message);
          return;
        }
        setLoadError(null);
        setRows((data ?? []) as StoredResource[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refresh = () => setVersion((v) => v + 1);

  const pickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    setMsg(null);
    if (picked) {
      const problem = checkFile(picked);
      if (problem) {
        setMsg({ type: "error", text: problem });
        setFile(null);
        setFileKey((k) => k + 1);
        return;
      }
      // Suggest a title from the file name when the title is still empty.
      if (!title.trim()) setTitle(picked.name.replace(/\.[^.]*$/, "").replace(/[-_]+/g, " ").trim());
    }
    setFile(picked);
  };

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    setMsg(null);
    const cleanTitle = title.trim();
    if (cleanTitle.length < 3) {
      setMsg({ type: "error", text: "Give the file a title of at least 3 characters." });
      return;
    }
    const cleanCategory = category.trim();
    if (!cleanCategory) {
      setMsg({ type: "error", text: "Add a category, for example Maths Notes or Flashcards." });
      return;
    }
    const cleanDescription = description.trim();
    if (!file) {
      setMsg({ type: "error", text: "Choose a PDF or image to upload." });
      return;
    }
    const problem = checkFile(file);
    if (problem) {
      setMsg({ type: "error", text: problem });
      return;
    }

    setUploading(true);
    const path = storagePath(file);
    const bucket = supabase.storage.from(RESOURCE_BUCKET);

    const { error: uploadError } = await bucket.upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setUploading(false);
      setMsg({ type: "error", text: `The upload failed: ${uploadError.message}` });
      return;
    }

    const url = bucket.getPublicUrl(path).data.publicUrl;
    const kind = resourceKind({ download_url: url, file_type: file.type.startsWith("image/") ? "image" : "pdf" });

    const { data, error: insertError } = await supabase
      .from("resources")
      .insert({
        title: cleanTitle,
        description: cleanDescription || null,
        category: cleanCategory,
        size: formatSize(file.size),
        recommended_for: exam,
        download_url: url,
        file_path: path,
        file_type: kind,
      })
      .select("id");

    if (insertError || !data?.length) {
      // Do not leave an orphan file behind.
      await bucket.remove([path]);
      setUploading(false);
      setMsg({ type: "error", text: `The file uploaded but could not be saved: ${insertError?.message ?? "no permission"}.` });
      return;
    }

    await logAdminAction({
      action: "added",
      entityType: "resource",
      label: cleanTitle,
      details: {
        resource_id: data[0].id,
        category: cleanCategory,
        description: cleanDescription || null,
        recommended_for: exam,
        file_type: kind,
        size: formatSize(file.size),
        file_path: path,
      },
    });

    setUploading(false);
    setTitle("");
    setDescription("");
    setFile(null);
    setFileKey((k) => k + 1);
    setMsg({ type: "success", text: `"${cleanTitle}" is uploaded. Students can download it from the Study Material page now.` });
    refresh();
  };

  const remove = async (row: StoredResource) => {
    setBusyId(row.id);
    setMsg(null);
    const { data, error } = await supabase.from("resources").delete().eq("id", row.id).select("id");
    if (error || !data?.length) {
      setBusyId(null);
      setMsg({ type: "error", text: error?.message ?? "The file was not deleted. You may not have permission." });
      return;
    }
    // The row is gone, so students no longer see it. Now remove the stored file too.
    let leftover = false;
    if (row.file_path) {
      const { error: removeError } = await supabase.storage.from(RESOURCE_BUCKET).remove([row.file_path]);
      leftover = Boolean(removeError);
    }
    await logAdminAction({
      action: "deleted",
      entityType: "resource",
      label: row.title,
      details: { resource_id: row.id, category: row.category, file_path: row.file_path, file_left_in_storage: leftover },
    });
    setBusyId(null);
    setMsg({
      type: leftover ? "error" : "success",
      text: leftover
        ? `"${row.title}" was removed from the Study Material page, but its file could not be deleted from storage.`
        : `"${row.title}" was deleted.`,
    });
    refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Content Management</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Study Materials</h1>
        <p className="mt-1 text-sm text-steel-300">
          Upload PDFs and images. They appear on the student Study Material page straight away, ready to download.
        </p>
      </div>

      {msg ? (
        <p
          role={msg.type === "success" ? "status" : "alert"}
          className={
            msg.type === "success"
              ? "rounded-control border border-emerald-400/30 bg-emerald-400/10 p-3 text-xs font-semibold text-emerald-300"
              : "rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400"
          }
        >
          {msg.text}
        </p>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Upload a File</CardTitle>
          <CardDescription>PDF, PNG, JPG or WebP. Up to {formatSize(MAX_UPLOAD_BYTES)}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={upload} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="res-file">File</Label>
              <Input
                key={fileKey}
                id="res-file"
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                onChange={pickFile}
                className="cursor-pointer py-1.5 file:mr-3 file:cursor-pointer file:rounded-control file:border-0 file:bg-navy-800 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-steel-100"
              />
              {file ? (
                <p className="text-xs text-steel-300">
                  {file.name} ({formatSize(file.size)})
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="res-title">Title</Label>
              <Input
                id="res-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g. Trigonometry Formula Sheet"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="res-description">Description</Label>
              <textarea
                id="res-description"
                rows={3}
                maxLength={MAX_DESCRIPTION}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is in this file, and who is it for? (optional)"
                className={textareaClass}
              />
              <p className="text-right text-xs tabular-nums text-steel-500">
                {description.length}/{MAX_DESCRIPTION}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="res-category">Category</Label>
                <Input
                  id="res-category"
                  list="res-category-options"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={MAX_CATEGORY}
                  placeholder="e.g. Maths Notes"
                  required
                />
                <datalist id="res-category-options">
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-exam">Recommended for</Label>
                <Select id="res-exam" value={exam} onChange={(e) => setExam(e.target.value)}>
                  {RESOURCE_EXAMS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end border-t border-steel-700/60 pt-5">
              <Button type="submit" loading={uploading}>
                {uploading ? "Uploading..." : "Upload file"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uploaded Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loadError ? <p role="alert" className="text-xs text-danger-400">Could not load files: {loadError}</p> : null}
          {!rows && !loadError ? <p className="text-xs text-steel-300">Loading files...</p> : null}
          {rows && rows.length === 0 ? <p className="text-xs text-steel-300">No files yet. Upload the first one above.</p> : null}

          {rows && rows.length > 0 ? (
            <ul className="divide-y divide-steel-700/40">
              {rows.map((row) => {
                const kind = resourceKind(row);
                const hasLink = row.download_url && row.download_url !== "#";
                return (
                  <li key={row.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <p className="truncate text-sm font-semibold text-white">{row.title}</p>
                      {row.description ? <p className="line-clamp-2 text-xs text-steel-300">{row.description}</p> : null}
                      <div className="flex flex-wrap items-center gap-2">
                        {row.category ? <Badge variant="outline">{row.category}</Badge> : null}
                        <Badge variant={kind === "pdf" ? "gold" : "emerald"}>{kind === "pdf" ? "PDF" : "Image"}</Badge>
                        {row.size ? <Badge variant="neutral">{row.size}</Badge> : null}
                        {row.recommended_for ? <span className="text-xs text-steel-300">For {row.recommended_for}</span> : null}
                        <span className="text-xs tabular-nums text-steel-500">{row.downloads} downloads</span>
                        {!row.file_path ? <span className="text-xs text-steel-500">External link</span> : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {hasLink ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={row.download_url} target="_blank" rel="noopener noreferrer">
                            Open<span className="sr-only"> {row.title} (opens in a new tab)</span>
                          </a>
                        </Button>
                      ) : null}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={busyId === row.id} aria-label={`Delete ${row.title}`}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent tone="danger">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{row.title}&quot; will disappear from the student Study Material page and the stored file is removed for good.
                              The action is saved in the audit log.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep it</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void remove(row)}>Delete file</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
