"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Select } from "@/components/ui/select";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { sortChapters } from "@/lib/taxonomy";
import { logAdminAction } from "@/lib/adminLog";
import { cardCount, DECK_LIMITS, formatCards, parseCards, type Card as FlashCard, type Deck } from "@/lib/flashcards";
import { supabase } from "@/lib/supabaseClient";

type Message = { type: "success" | "error"; text: string } | null;
interface FormState {
  title: string;
  subjectId: string;
  chapterId: string;
  description: string;
  cards: string;
}

function filedLabel(deck: Deck, tax: { subjects: { id: string; name: string }[]; chapters: { id: string; name: string }[] }): string {
  const subject = tax.subjects.find((x) => x.id === deck.subject_id)?.name;
  const chapter = tax.chapters.find((x) => x.id === deck.chapter_id)?.name;
  return [subject, chapter].filter(Boolean).join(" > ") || "Not filed";
}

const EMPTY_FORM: FormState = { title: "", subjectId: "", chapterId: "", description: "", cards: "" };
const inputClass =
  "w-full rounded-control border border-steel-700 bg-navy-950 px-3 py-2 text-sm text-steel-100 placeholder:text-steel-500 focus:border-gold-400 focus:outline-none";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-steel-300";

export default function AdminFlashcardsPage() {
  const [decks, setDecks] = React.useState<Deck[] | null>(null);
  const [version, setVersion] = React.useState(0);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = React.useState<Deck | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<Message>(null);
  const taxonomy = useTaxonomy();

  React.useEffect(() => {
    let active = true;
    supabase
      .from("flashcard_decks")
      .select("id, title, category, description, created_at, subject_id, chapter_id, flashcards(count)")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) return setLoadError(error.message);
        setLoadError(null);
        setDecks((data ?? []) as unknown as Deck[]);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refresh = () => setVersion((v) => v + 1);
  const setField = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = async (deck: Deck) => {
    setBusyId(deck.id);
    setMsg(null);
    const { data, error } = await supabase.from("flashcards").select("id, front, back, position").eq("deck_id", deck.id).order("position", { ascending: true });
    setBusyId(null);
    if (error) return setMsg({ type: "error", text: error.message });
    setEditing(deck);
    setForm({ title: deck.title, subjectId: deck.subject_id ?? "", chapterId: deck.chapter_id ?? "", description: deck.description, cards: formatCards((data ?? []) as FlashCard[]) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const title = form.title.trim();
    const description = form.description.trim();
    if (title.length < DECK_LIMITS.titleMin || title.length > DECK_LIMITS.titleMax) {
      return setMsg({ type: "error", text: `Title must be ${DECK_LIMITS.titleMin} to ${DECK_LIMITS.titleMax} characters.` });
    }
    if (description.length > DECK_LIMITS.descriptionMax) {
      return setMsg({ type: "error", text: `Description can be at most ${DECK_LIMITS.descriptionMax} characters.` });
    }
    const subject = taxonomy.subjects.find((x) => x.id === form.subjectId);
    const chapter = taxonomy.chapters.find((x) => x.id === form.chapterId && x.subject_id === form.subjectId);
    // "category" stays filled (chapter, else subject) so older readers of the table keep working.
    const filing = {
      subject_id: subject?.id ?? null,
      chapter_id: subject && chapter ? chapter.id : null,
      category: chapter?.name ?? subject?.name ?? "General",
    };
    const parsed = parseCards(form.cards);
    if (!parsed.ok) return setMsg({ type: "error", text: parsed.error });

    setSaving(true);
    let deckId = editing?.id ?? "";

    if (editing) {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .update({ title, ...filing, description })
        .eq("id", editing.id)
        .select("id");
      if (error || !data?.length) {
        setSaving(false);
        return setMsg({ type: "error", text: error?.code === "23505" ? "A deck with this title already exists." : (error?.message ?? "Could not save the deck.") });
      }
    } else {
      const { data, error } = await supabase.from("flashcard_decks").insert({ title, ...filing, description }).select("id");
      if (error || !data?.length) {
        setSaving(false);
        return setMsg({ type: "error", text: error?.code === "23505" ? "A deck with this title already exists." : (error?.message ?? "Could not save the deck.") });
      }
      deckId = data[0].id as string;
    }

    // Add the new set of cards first, then remove the old ones, so a failure never leaves the deck empty.
    const oldIds = editing ? ((await supabase.from("flashcards").select("id").eq("deck_id", deckId)).data ?? []).map((r) => r.id as string) : [];
    const { error: insertError } = await supabase
      .from("flashcards")
      .insert(parsed.cards.map((c, i) => ({ deck_id: deckId, front: c.front, back: c.back, position: i + 1 })));
    if (insertError) {
      setSaving(false);
      refresh();
      return setMsg({ type: "error", text: `The deck was saved but its cards were not: ${insertError.message}` });
    }
    if (oldIds.length > 0) {
      const { error: removeError } = await supabase.from("flashcards").delete().in("id", oldIds);
      if (removeError) {
        setSaving(false);
        refresh();
        return setMsg({ type: "error", text: `Cards were saved but the old copies could not be removed: ${removeError.message}` });
      }
    }

    await logAdminAction({
      action: editing ? "edited" : "added",
      entityType: "flashcard_deck",
      label: title,
      details: { deck_id: deckId, cards: parsed.cards.length },
    });
    setSaving(false);
    setMsg({ type: "success", text: `${editing ? "Saved" : "Added"} "${title}" with ${parsed.cards.length} cards.` });
    resetForm();
    refresh();
  };

  const handleDelete = async (deck: Deck) => {
    if (!window.confirm(`Delete "${deck.title}" and all its cards? This cannot be undone.`)) return;
    setBusyId(deck.id);
    setMsg(null);
    const { data, error } = await supabase.from("flashcard_decks").delete().eq("id", deck.id).select("id");
    setBusyId(null);
    if (error || !data?.length) return setMsg({ type: "error", text: error?.message ?? "Could not delete the deck." });
    await logAdminAction({ action: "deleted", entityType: "flashcard_deck", label: deck.title, details: { deck_id: deck.id } });
    if (editing?.id === deck.id) resetForm();
    setMsg({ type: "success", text: `Deleted "${deck.title}".` });
    refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Content Management</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Flashcards</h1>
        <p className="mt-1 text-sm text-steel-300">Add, edit or delete the decks students see on the Flashcards page.</p>
      </div>

      {msg ? (
        <div
          role={msg.type === "error" ? "alert" : "status"}
          className={`flex max-w-3xl items-start gap-2 rounded-control border p-3 text-xs ${
            msg.type === "success" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-danger-500/40 bg-danger-500/10 text-danger-300"
          }`}
        >
          {msg.type === "success" ? <Icons.checkCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Icons.info className="mt-0.5 size-4 shrink-0" aria-hidden />}
          <span>{msg.text}</span>
        </div>
      ) : null}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">{editing ? `Edit: ${editing.title}` : "Add New Deck"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="deck-title" className={labelClass}>Title</label>
                <input id="deck-title" required maxLength={DECK_LIMITS.titleMax} value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Maths formulas" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label htmlFor="deck-subject" className={labelClass}>Subject</label>
                <Select id="deck-subject" value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value, chapterId: "" }))}>
                  <option value="">No subject (shown under Other)</option>
                  {taxonomy.subjects.map((x) => (
                    <option key={x.id} value={x.id}>{x.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="deck-chapter" className={labelClass}>Chapter</label>
                <Select id="deck-chapter" value={form.chapterId} disabled={!form.subjectId} onChange={(e) => setField("chapterId", e.target.value)}>
                  <option value="">{form.subjectId ? "No chapter" : "Pick a subject first"}</option>
                  {sortChapters(taxonomy.chapters.filter((c) => c.subject_id === form.subjectId)).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <p className="text-xs text-steel-500">Add subjects and chapters under Admin Suite, Subjects, Chapters.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="deck-description" className={labelClass}>Description (optional)</label>
              <textarea id="deck-description" rows={2} maxLength={DECK_LIMITS.descriptionMax} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="One line shown on the deck card." className={inputClass} />
            </div>

            <div className="space-y-1">
              <label htmlFor="deck-cards" className={labelClass}>Cards</label>
              <textarea
                id="deck-cards"
                rows={10}
                value={form.cards}
                onChange={(e) => setField("cards", e.target.value)}
                placeholder={"sin²θ + cos²θ = ? | 1\nWhere is the NDA? | Khadakwasla, Pune"}
                className={`${inputClass} font-mono`}
              />
              <p className="text-xs text-steel-500">One card per line: question, then a bar, then the answer. Up to {DECK_LIMITS.cardsMax} cards.</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save changes" : "Add deck"}
              </Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Decks</CardTitle>
          {decks ? <Badge variant="outline">{decks.length} total</Badge> : null}
        </CardHeader>
        <CardContent>
          {loadError ? <p role="alert" className="text-xs text-danger-300">Could not load decks: {loadError}. Have you run migration 011?</p> : null}
          {!decks && !loadError ? <p className="text-xs text-steel-300">Loading decks...</p> : null}
          {decks && decks.length === 0 ? <p className="text-xs text-steel-300">No decks yet. Add the first one above.</p> : null}
          {decks && decks.length > 0 ? (
            <ul className="divide-y divide-steel-700/50">
              {decks.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-white">{d.title}</div>
                    <p className="mt-0.5 text-xs text-steel-300">{filedLabel(d, taxonomy)} · {cardCount(d)} cards</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" disabled={busyId === d.id} onClick={() => void startEdit(d)} aria-label={`Edit ${d.title}`}>Edit</Button>
                    <Button variant="danger" size="sm" disabled={busyId === d.id} onClick={() => void handleDelete(d)} aria-label={`Delete ${d.title}`}>Delete</Button>
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
