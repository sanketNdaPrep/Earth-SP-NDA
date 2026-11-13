"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";
import { logAdminAction } from "@/lib/adminLog";
import { slugify, SUBJECT_ICONS, type Subject } from "@/lib/subjects";
import { supabase } from "@/lib/supabaseClient";

type Message = { type: "success" | "error"; text: string } | null;

interface FormState {
  name: string;
  code: string;
  description: string;
  icon_name: string;
  sort_order: string;
}

const EMPTY_FORM: FormState = { name: "", code: "", description: "", icon_name: "shield", sort_order: "0" };

const inputClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = Icons[name as keyof typeof Icons] ?? Icons.shield;
  return <Icon className={className} aria-hidden />;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[] | null>(null);
  const [version, setVersion] = React.useState(0);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = React.useState<Subject | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);

  React.useEffect(() => {
    let active = true;
    supabase
      .from("subjects")
      .select("id, name, slug, code, description, icon_name, is_active, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadError(error.message);
          return;
        }
        setLoadError(null);
        setSubjects((data ?? []) as Subject[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refresh = () => setVersion((v) => v + 1);
  const setField = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const startEdit = (subject: Subject) => {
    setEditing(subject);
    setMsg(null);
    setForm({
      name: subject.name,
      code: subject.code ?? "",
      description: subject.description,
      icon_name: subject.icon_name,
      sort_order: String(subject.sort_order),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const name = form.name.trim();
    const description = form.description.trim();
    const code = form.code.trim();
    const sortOrder = Number.parseInt(form.sort_order, 10);

    if (name.length < 2 || name.length > 60) return setMsg({ type: "error", text: "Name must be 2 to 60 characters." });
    if (description.length > 300) return setMsg({ type: "error", text: "Description can be at most 300 characters." });
    if (Number.isNaN(sortOrder)) return setMsg({ type: "error", text: "Display order must be a number." });

    setSaving(true);

    if (!editing) {
      const slug = slugify(name);
      if (!slug) {
        setSaving(false);
        return setMsg({ type: "error", text: "Use letters or numbers in the name." });
      }
      const { data, error } = await supabase
        .from("subjects")
        .insert({ name, slug, code: code || null, description, icon_name: form.icon_name, sort_order: sortOrder })
        .select("id");
      setSaving(false);
      if (error || !data?.length) {
        const duplicate = error?.code === "23505";
        return setMsg({
          type: "error",
          text: duplicate ? "A subject with this name already exists." : (error?.message ?? "Could not save the subject."),
        });
      }
      await logAdminAction({ action: "added", entityType: "subject", label: name, details: { subject_id: data[0].id } });
      setMsg({ type: "success", text: `Added "${name}". It is live on the homepage.` });
      resetForm();
      return refresh();
    }

    // Edit: send and log only the fields that really changed
    const next = { name, code: code || null, description, icon_name: form.icon_name, sort_order: sortOrder };
    const changes: Record<string, [unknown, unknown]> = {};
    (Object.keys(next) as (keyof typeof next)[]).forEach((key) => {
      if (next[key] !== editing[key]) changes[key] = [editing[key], next[key]];
    });
    if (Object.keys(changes).length === 0) {
      setSaving(false);
      return setMsg({ type: "error", text: "Nothing has changed." });
    }

    const { data, error } = await supabase.from("subjects").update(next).eq("id", editing.id).select("id");
    setSaving(false);
    if (error || !data?.length) {
      return setMsg({ type: "error", text: error?.message ?? "Could not save the changes." });
    }
    await logAdminAction({ action: "edited", entityType: "subject", label: name, details: { subject_id: editing.id, changes } });
    setMsg({ type: "success", text: `Saved changes to "${name}".` });
    resetForm();
    refresh();
  };

  const toggleActive = async (subject: Subject) => {
    setBusyId(subject.id);
    setMsg(null);
    const nextActive = !subject.is_active;
    const { data, error } = await supabase.from("subjects").update({ is_active: nextActive }).eq("id", subject.id).select("id");
    setBusyId(null);
    if (error || !data?.length) {
      return setMsg({ type: "error", text: error?.message ?? "Could not change the status." });
    }
    await logAdminAction({
      action: nextActive ? "activated" : "deactivated",
      entityType: "subject",
      label: subject.name,
      details: { subject_id: subject.id },
    });
    setMsg({
      type: "success",
      text: nextActive ? `"${subject.name}" is now shown on the homepage.` : `"${subject.name}" is hidden from the homepage. Nothing was deleted.`,
    });
    refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Content Management</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Subjects</h1>
        <p className="mt-1 text-sm text-steel-300">
          These are the entry schemes on the homepage. Hide one to remove it from the homepage without deleting it.
        </p>
      </div>

      {msg ? (
        <div
          role={msg.type === "error" ? "alert" : "status"}
          className={`flex max-w-3xl items-start gap-2 rounded-control border p-3 text-xs ${
            msg.type === "success"
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              : "border-danger-500/40 bg-danger-500/10 text-danger-300"
          }`}
        >
          {msg.type === "success" ? <Icons.checkCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Icons.info className="mt-0.5 size-4 shrink-0" aria-hidden />}
          <span>{msg.text}</span>
        </div>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">{editing ? `Edit: ${editing.name}` : "Add New Subject"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="subject-name" className={labelClass}>Name</label>
                <input id="subject-name" required maxLength={60} value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="NDA 2027" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label htmlFor="subject-code" className={labelClass}>Short label (optional)</label>
                <input id="subject-code" maxLength={40} value={form.code} onChange={(e) => setField("code", e.target.value)} placeholder="NDA / NA" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="subject-description" className={labelClass}>Description</label>
              <textarea id="subject-description" rows={3} maxLength={300} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="One or two lines shown on the homepage card." className={inputClass} />
              <p className="text-xs text-steel-500">{form.description.length} / 300</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="subject-icon" className={labelClass}>Icon</label>
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-steel-700 bg-navy-950 text-gold-400">
                    <SubjectIcon name={form.icon_name} className="size-5" />
                  </span>
                  <Select id="subject-icon" value={form.icon_name} onChange={(e) => setField("icon_name", e.target.value)}>
                    {SUBJECT_ICONS.map((name) => (
                      <option key={name} value={name}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="subject-order" className={labelClass}>Display order</label>
                <input id="subject-order" type="number" value={form.sort_order} onChange={(e) => setField("sort_order", e.target.value)} className={inputClass} />
                <p className="text-xs text-steel-500">Smaller numbers appear first.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Add subject"}
              </Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Subjects</CardTitle>
          {subjects ? <Badge variant="outline">{subjects.length} total</Badge> : null}
        </CardHeader>
        <CardContent>
          {loadError ? <p role="alert" className="text-xs text-danger-300">Could not load subjects: {loadError}</p> : null}
          {!subjects && !loadError ? <p className="text-xs text-steel-300">Loading subjects...</p> : null}
          {subjects && subjects.length === 0 ? <p className="text-xs text-steel-300">No subjects yet. Add the first one above.</p> : null}
          {subjects && subjects.length > 0 ? (
            <ul className="divide-y divide-steel-700/50">
              {subjects.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-steel-700 bg-navy-950 text-gold-400">
                      <SubjectIcon name={s.icon_name} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white">
                        {s.name} {s.code ? <span className="ml-1 font-mono text-xs font-normal text-steel-500">{s.code}</span> : null}
                      </div>
                      <p className="mt-0.5 text-xs text-steel-300">{s.description || "No description"}</p>
                      <p className="mt-0.5 font-mono text-xs text-steel-500">/{s.slug} · order {s.sort_order}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={s.is_active ? "emerald" : "outline"}>{s.is_active ? "Shown" : "Hidden"}</Badge>
                    <Button variant="outline" size="sm" onClick={() => startEdit(s)} aria-label={`Edit ${s.name}`}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === s.id}
                      onClick={() => toggleActive(s)}
                      aria-label={`${s.is_active ? "Hide" : "Show"} ${s.name} on the homepage`}
                    >
                      {s.is_active ? "Hide" : "Show"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
