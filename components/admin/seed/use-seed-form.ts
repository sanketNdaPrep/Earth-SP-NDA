'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
} from 'react';
import { supabase } from '@/lib/supabaseClient';
import { OPTS, TAXONOMY } from './data';
import { clearDraft, isEmptyDraft, loadDraft, saveDraft } from './draft-storage';
import { checkQuestion, firstFailure, hasFailures } from './validators';
import { useModuleQuestions } from './use-module-questions';
import type {
  Banner,
  FieldKey,
  LoadState,
  Opt,
  OptionsMap,
  Quiz,
  SeedDraft,
  SessionEntry,
} from './types';

const EMPTY_OPTIONS: OptionsMap = { A: '', B: '', C: '', D: '' };

/**
 * All state and every Supabase call for the seeding page lives here.
 * Queries are the same as the original page: quizzes select/insert,
 * questions count + insert, resources insert.
 */
export function useSeedForm() {
  // Modules
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesState, setQuizzesState] = useState<LoadState>('loading');
  const [quizId, setQuizId] = useState('');
  const [moduleCount, setModuleCount] = useState<number | null>(null);
  const [showNewModule, setShowNewModule] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('NDA');
  const [newDescription, setNewDescription] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(10);
  const [creatingModule, setCreatingModule] = useState(false);

  // Classification (UI only)
  const [group, setGroup] = useState('NDA Maths');
  const [subject, setSubject] = useState('Algebra');

  // Question
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<OptionsMap>(EMPTY_OPTIONS);
  const [correct, setCorrect] = useState<Opt | null>(null);
  const [explanation, setExplanation] = useState('');

  // Resource link
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resSize, setResSize] = useState('');
  const [resCategory, setResCategory] = useState('Study Planner');

  // Preview
  const [previewPick, setPreviewPick] = useState<Opt | null>(null);
  const [reveal, setReveal] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [session, setSession] = useState<SessionEntry[]>([]);

  const questionRef = useRef<HTMLTextAreaElement>(null);
  const lastField = useRef<{ el: HTMLInputElement | HTMLTextAreaElement; key: FieldKey } | null>(null);

  const selectedQuiz = quizzes.find((q) => q.id === quizId) ?? null;

  // Questions already in the module, used for duplicate detection and the bank tab
  const moduleQuestions = useModuleQuestions(quizId);

  // Live quality checks; `fail` blocks publishing, `warn` is advice
  const checks = useMemo(
    () =>
      checkQuestion(
        { question, options, correct, explanation, resUrl, resTitle },
        moduleQuestions.items.map((q) => q.question_text),
      ),
    [question, options, correct, explanation, resUrl, resTitle, moduleQuestions.items],
  );

  // Draft autosave
  const [pendingDraft, setPendingDraft] = useState<SeedDraft | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  /* ------------------------------ Data loading ----------------------------- */

  const fetchQuizzes = useCallback(async (selectId?: string) => {
    const { data, error } = await supabase.from('quizzes').select('id, title, category');
    if (error) {
      setQuizzesState('error');
      return;
    }
    const rows = (data ?? []) as Quiz[];
    setQuizzes(rows);
    setQuizzesState('ready');
    setQuizId((current) => selectId ?? (current || rows[0]?.id || ''));
  }, []);

  useEffect(() => {
    void fetchQuizzes();
  }, [fetchQuizzes]);

  const refreshCount = useCallback(async (id: string) => {
    if (!id) {
      setModuleCount(null);
      return;
    }
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', id);
    setModuleCount(count ?? 0);
  }, []);

  useEffect(() => {
    void refreshCount(quizId);
  }, [quizId, refreshCount]);

  useEffect(() => {
    if (banner?.type !== 'success') return;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  /* ------------------------------ Draft autosave ----------------------------- */

  // On first load, offer to restore whatever was being typed last time.
  useEffect(() => {
    const saved = loadDraft();
    if (saved && !isEmptyDraft(saved)) setPendingDraft(saved);
  }, []);

  // Save 600 ms after the last keystroke. Paused while the restore offer is open.
  useEffect(() => {
    if (pendingDraft) return;
    const snapshot = { quizId, group, subject, question, options, correct, explanation };
    if (isEmptyDraft(snapshot)) {
      clearDraft();
      setDraftSavedAt(null);
      return;
    }
    const timer = setTimeout(() => {
      const saved = saveDraft(snapshot);
      if (saved) setDraftSavedAt(saved.savedAt);
    }, 600);
    return () => clearTimeout(timer);
  }, [pendingDraft, quizId, group, subject, question, options, correct, explanation]);

  const restoreDraft = () => {
    if (!pendingDraft) return;
    const d = pendingDraft;
    if (TAXONOMY[d.group]) {
      setGroup(d.group);
      setSubject(TAXONOMY[d.group].includes(d.subject) ? d.subject : TAXONOMY[d.group][0]);
    }
    if (quizzes.some((q) => q.id === d.quizId)) setQuizId(d.quizId);
    setQuestion(d.question);
    setOptions(d.options);
    setCorrect(d.correct);
    setExplanation(d.explanation);
    setPendingDraft(null);
  };

  const discardDraft = () => {
    clearDraft();
    setPendingDraft(null);
  };

  /* ----------------------------- Field helpers ----------------------------- */

  const setOption = useCallback((opt: Opt, value: string) => {
    setOptions((prev) => ({ ...prev, [opt]: value }));
  }, []);

  const setField = useCallback((key: FieldKey, value: string) => {
    if (key === 'question') setQuestion(value);
    else if (key === 'explanation') setExplanation(value);
    else setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Spread onto an input/textarea so the symbol helper knows where to insert. */
  const trackFocus = (key: FieldKey) => ({
    onFocus: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      lastField.current = { el: event.currentTarget, key };
    },
  });

  const insertSymbol = (symbol: string) => {
    const target =
      lastField.current ??
      (questionRef.current ? { el: questionRef.current, key: 'question' as FieldKey } : null);
    if (!target) return;
    const { el, key } = target;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    setField(key, el.value.slice(0, start) + symbol + el.value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + symbol.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const selectGroup = (name: string) => {
    setGroup(name);
    setSubject(TAXONOMY[name][0]);
  };

  /* -------------------------------- Handlers -------------------------------- */

  const clearEntry = () => {
    setQuestion('');
    setOptions(EMPTY_OPTIONS);
    setCorrect(null);
    setExplanation('');
    setResTitle('');
    setResUrl('');
    setResSize('');
    setPreviewPick(null);
    setReveal(false);
    clearDraft();
    setDraftSavedAt(null);
  };

  const resetForm = () => {
    clearEntry();
    setBanner(null);
    questionRef.current?.focus();
  };

  const handleCreateModule = async () => {
    if (creatingModule) return;
    setCreatingModule(true);
    setBanner(null);

    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        time_limit_mins: Number(newTimeLimit),
      })
      .select()
      .single();

    setCreatingModule(false);

    if (error) {
      setBanner({ type: 'error', text: `Failed to create module: ${error.message}` });
      return;
    }
    if (data) {
      setBanner({ type: 'success', text: `Module "${data.title}" created.` });
      setNewTitle('');
      setNewDescription('');
      setShowNewModule(false);
      await fetchQuizzes(data.id);
    }
  };

  const validate = (): string | null => {
    if (!quizId) return 'Select or create a module first.';
    return firstFailure(checks);
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (saving) return;

    const problem = validate();
    if (problem) {
      setBanner({ type: 'error', text: problem });
      return;
    }

    setSaving(true);
    setBanner(null);

    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);
    const nextPosition = (count || 0) + 1;

    const { error } = await supabase.from('questions').insert({
      quiz_id: quizId,
      question_text: question.trim(),
      option_a: options.A.trim(),
      option_b: options.B.trim(),
      option_c: options.C.trim(),
      option_d: options.D.trim(),
      correct_option: correct,
      explanation: explanation.trim() || null,
      position: nextPosition,
    });

    if (error) {
      setSaving(false);
      setBanner({ type: 'error', text: `Failed to add question: ${error.message}` });
      return;
    }

    let resourceFailed = false;
    let resourceNote = '';
    if (resUrl.trim()) {
      const { error: resError } = await supabase.from('resources').insert({
        title: resTitle.trim(),
        category: resCategory,
        size: resSize.trim(),
        recommended_for: `${selectedQuiz?.category ?? 'NDA'} Aspirants`,
        download_url: resUrl.trim(),
        downloads: 0,
      });
      resourceFailed = Boolean(resError);
      resourceNote = resError
        ? ` The question was saved, but the resource link failed: ${resError.message}`
        : ' Resource link published to the vault.';
    }

    setSaving(false);
    setBanner({
      type: resourceFailed ? 'error' : 'success',
      text: `Question #${nextPosition} added to "${selectedQuiz?.title}".${resourceNote}`,
    });
    setSession((prev) => [
      {
        n: nextPosition,
        topic: `${group} / ${subject}`,
        text: question.trim(),
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
    clearEntry();
    void refreshCount(quizId);
    void moduleQuestions.refresh();
    questionRef.current?.focus();
  };

  const filledOptions = useMemo(() => OPTS.filter((o) => options[o].trim()).length, [options]);
  const ready = Boolean(quizId) && !hasFailures(checks);

  /** Called by the bulk importer after rows were inserted. */
  const afterImport = async () => {
    await Promise.all([refreshCount(quizId), moduleQuestions.refresh()]);
  };

  return {
    // modules
    quizzes, quizzesState, quizId, setQuizId, moduleCount, selectedQuiz,
    showNewModule, setShowNewModule,
    newTitle, setNewTitle, newCategory, setNewCategory,
    newDescription, setNewDescription, newTimeLimit, setNewTimeLimit,
    creatingModule, handleCreateModule,
    // classification
    group, selectGroup, subject, setSubject,
    // question
    question, setQuestion, options, setOption, correct, setCorrect,
    explanation, setExplanation, questionRef, trackFocus, insertSymbol,
    // resource
    resTitle, setResTitle, resUrl, setResUrl, resSize, setResSize,
    resCategory, setResCategory,
    // preview
    previewPick, setPreviewPick, reveal, setReveal,
    // status
    saving, banner, setBanner, session, filledOptions, ready,
    // quality, drafts, module questions
    checks, moduleQuestions, afterImport,
    pendingDraft, draftSavedAt, restoreDraft, discardDraft,
    // actions
    handleSubmit, resetForm,
  };
}

export type SeedForm = ReturnType<typeof useSeedForm>;