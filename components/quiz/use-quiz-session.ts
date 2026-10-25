'use client';

import { useEffect, useReducer } from 'react';
import { clearSession, isStorageWritable, loadSession, saveSession, sessionKey } from './storage';
import type { AnswerMap, FlagMap, OptionLetter } from './types';

export interface SessionState {
  phase: 'briefing' | 'running' | 'submitted';
  current: number;
  answers: AnswerMap;
  marked: FlagMap;
  visited: FlagMap;
  startedAt: number | null;
  endsAt: number | null;
  finishedAt: number | null;
  /** True when the attempt was brought back from the auto-save buffer. */
  restored: boolean;
  /** False when the browser refuses to store data, so the cadet can be told. */
  storageOk: boolean;
}

type Action =
  | { type: 'begin'; now: number; limitSecs: number | null; firstId: string }
  | { type: 'go'; index: number; id: string }
  | { type: 'select'; id: string; letter: OptionLetter }
  | { type: 'clear'; id: string }
  | { type: 'mark'; id: string }
  | { type: 'dismiss-restored' }
  | { type: 'submit'; now: number };

function without<T extends Record<string, unknown>>(map: T, id: string): T {
  const next = { ...map };
  delete next[id];
  return next;
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'begin':
      return {
        ...state,
        phase: 'running',
        startedAt: action.now,
        endsAt: action.limitSecs === null ? null : action.now + action.limitSecs * 1000,
        current: 0,
        visited: { [action.firstId]: true },
      };
    case 'go':
      return { ...state, current: action.index, visited: { ...state.visited, [action.id]: true } };
    case 'select':
      return { ...state, answers: { ...state.answers, [action.id]: action.letter } };
    case 'clear':
      return { ...state, answers: without(state.answers, action.id) };
    case 'mark':
      return {
        ...state,
        marked: state.marked[action.id] ? without(state.marked, action.id) : { ...state.marked, [action.id]: true },
      };
    case 'dismiss-restored':
      return { ...state, restored: false };
    case 'submit':
      return { ...state, phase: 'submitted', finishedAt: action.now };
  }
}

/** Runs once, on the client, because the player only mounts after the questions have loaded. */
function createState(key: string, quizId: string, questionIds: string[]): SessionState {
  const base: SessionState = {
    phase: 'briefing',
    current: 0,
    answers: {},
    marked: {},
    visited: {},
    startedAt: null,
    endsAt: null,
    finishedAt: null,
    restored: false,
    storageOk: isStorageWritable(),
  };

  const saved = loadSession(key);
  const usable =
    saved !== null &&
    saved.quizId === quizId &&
    saved.questionIds.length === questionIds.length &&
    saved.questionIds.every((id, index) => id === questionIds[index]);

  if (!usable) {
    if (saved) clearSession(key);
    return base;
  }

  const known = new Set(questionIds);
  const keep = <T extends Record<string, unknown>>(map: T) =>
    Object.fromEntries(Object.entries(map).filter(([id]) => known.has(id))) as T;

  return {
    ...base,
    phase: 'running',
    current: Math.min(Math.max(saved.current, 0), questionIds.length - 1),
    answers: keep(saved.answers),
    marked: keep(saved.marked),
    visited: keep(saved.visited),
    startedAt: saved.startedAt,
    endsAt: saved.endsAt,
    restored: true,
  };
}

export function useQuizSession(userKey: string, quizId: string, questionIds: string[]) {
  const key = sessionKey(userKey, quizId);
  const [state, dispatch] = useReducer(reducer, undefined, () => createState(key, quizId, questionIds));

  const { phase, startedAt, endsAt, current, answers, marked, visited } = state;

  // Auto-save after every change while the test is running.
  useEffect(() => {
    if (phase !== 'running' || startedAt === null) return;
    saveSession(key, { v: 1, quizId, questionIds, startedAt, endsAt, current, answers, marked, visited });
  }, [key, quizId, questionIds, phase, startedAt, endsAt, current, answers, marked, visited]);

  // A finished attempt must not come back as a "resume" on the next visit.
  useEffect(() => {
    if (phase === 'submitted') clearSession(key);
  }, [key, phase]);

  return { state, dispatch };
}