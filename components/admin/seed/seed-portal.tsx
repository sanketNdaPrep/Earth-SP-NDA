'use client';

import React, { useState } from 'react';
import type { SeedMode } from './types';

import {
  BulkImportPanel,
  DraftBanner,
  ExistingQuestions,
  FormActions,
  ModeTabs,
  ModuleBar,
  OptionsGrid,
  PANEL_ID,
  PreviewCard,
  QualityChecklist,
  QuestionEditor,
  ResourceLink,
  SeedHeader,
  SessionLog,
  ShortcutsHelp,
  SolutionBox,
  StatusBanner,
  SubjectPicker,
  tabId,
  useBulkImport,
  useSeedForm,
} from './index';

export function SeedPortal() {
  const [mode, setMode] = useState<SeedMode>('single');
  const form = useSeedForm();
  const bulk = useBulkImport(form);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <SeedHeader moduleCount={form.moduleCount} />

        {/* Global Banner Messages */}
        <StatusBanner banner={form.banner} onClose={() => form.setBanner(null)} />

        {/* Local Draft Autosave Offer */}
        <DraftBanner
          pendingDraft={form.pendingDraft}
          onRestore={form.restoreDraft}
          onDiscard={form.discardDraft}
        />

        {/* Module Target Selector */}
        <ModuleBar
          quizzes={form.quizzes}
          quizId={form.quizId}
          setQuizId={form.setQuizId}
          showNewModule={form.showNewModule}
          setShowNewModule={form.setShowNewModule}
          newTitle={form.newTitle}
          setNewTitle={form.setNewTitle}
          newCategory={form.newCategory}
          setNewCategory={form.setNewCategory}
          newDescription={form.newDescription}
          setNewDescription={form.setNewDescription}
          newTimeLimit={form.newTimeLimit}
          setNewTimeLimit={form.setNewTimeLimit}
          creatingModule={form.creatingModule}
          onCreateModule={form.handleCreateModule}
        />

        {/* Navigation Mode Switcher */}
        <ModeTabs
          mode={mode}
          setMode={setMode}
          bankCount={form.moduleQuestions.items.length}
        />

        {/* Dynamic Mode Tab Content */}
        <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(mode)}>
          {mode === 'single' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Input Controls */}
              <div className="lg:col-span-7 space-y-6">
                <SubjectPicker
                  group={form.group}
                  selectGroup={form.selectGroup}
                  subject={form.subject}
                  setSubject={form.setSubject}
                />

                <QuestionEditor
                  question={form.question}
                  setQuestion={form.setQuestion}
                  questionRef={form.questionRef}
                  insertSymbol={form.insertSymbol}
                  trackFocus={form.trackFocus}
                />

                <OptionsGrid
                  options={form.options}
                  setOption={form.setOption}
                  correct={form.correct}
                  setCorrect={form.setCorrect}
                  trackFocus={form.trackFocus}
                />

                <SolutionBox
                  explanation={form.explanation}
                  setExplanation={form.setExplanation}
                  trackFocus={form.trackFocus}
                />

                <ResourceLink
                  resTitle={form.resTitle}
                  setResTitle={form.setResTitle}
                  resUrl={form.resUrl}
                  setResUrl={form.setResUrl}
                  resSize={form.resSize}
                  setResSize={form.setResSize}
                  resCategory={form.resCategory}
                  setResCategory={form.setResCategory}
                />

                <FormActions
                  ready={form.ready}
                  saving={form.saving}
                  onReset={form.resetForm}
                  onSubmit={form.handleSubmit}
                />
              </div>

              {/* Right Column: Live Student Preview & Assistant Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <PreviewCard
                  group={form.group}
                  subject={form.subject}
                  question={form.question}
                  options={form.options}
                  correct={form.correct}
                  explanation={form.explanation}
                  previewPick={form.previewPick}
                  setPreviewPick={form.setPreviewPick}
                  reveal={form.reveal}
                  setReveal={form.setReveal}
                />

                <QualityChecklist checks={form.checks} />
                <ShortcutsHelp />
                <SessionLog session={form.session} />
              </div>
            </div>
          )}

          {mode === 'bulk' && <BulkImportPanel bulk={bulk} />}

          {mode === 'bank' && (
            <ExistingQuestions
              items={form.moduleQuestions.items}
              state={form.moduleQuestions.state}
              onRefresh={form.moduleQuestions.refresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}