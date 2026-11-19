"use client";

import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Chapter, TaxSubject } from "@/lib/taxonomy";

export interface Taxonomy {
  loading: boolean;
  subjects: TaxSubject[];
  chapters: Chapter[];
  error: string | null;
}

/** Loads the subjects and chapters. Pass a changing `version` to load them again. */
export function useTaxonomy(version = 0): Taxonomy {
  const [state, setState] = React.useState<Taxonomy>({ loading: true, subjects: [], chapters: [], error: null });

  React.useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("subjects").select("id, name, sort_order, cover_path, exams").eq("kind", "subject").order("sort_order", { ascending: true }),
      supabase.from("chapters").select("id, subject_id, name, sort_order").order("sort_order", { ascending: true }),
    ]).then(([subjects, chapters]) => {
      if (!active) return;
      // Missing chapters table (migration 013 not run yet) is not an error here: nothing is filed yet.
      const chaptersMissing = chapters.error && (chapters.error.code === "PGRST205" || /schema cache|does not exist/i.test(chapters.error.message));
      const error = subjects.error?.message ?? (chaptersMissing ? null : (chapters.error?.message ?? null));
      setState({
        loading: false,
        subjects: (subjects.data ?? []) as unknown as TaxSubject[],
        chapters: chaptersMissing ? [] : ((chapters.data ?? []) as Chapter[]),
        error,
      });
    });
    return () => {
      active = false;
    };
  }, [version]);

  return state;
}
