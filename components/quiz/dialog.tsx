'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  labelledBy: string;
  describedBy?: string;
  /** Called for Escape and for a click on the backdrop. */
  onClose: () => void;
  /** "sheet" docks to the bottom edge on phones. */
  variant?: 'center' | 'sheet';
  children: ReactNode;
}

/**
 * A native modal <dialog>: the browser traps focus, makes the page behind it inert,
 * restores focus when it closes and handles Escape. Mount it to open it, unmount it to close it.
 */
export function Dialog({ labelledBy, describedBy, onClose, variant = 'center', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const placement =
    variant === 'sheet'
      ? 'mb-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-b-none sm:mb-auto sm:max-w-md sm:rounded-b-lg'
      : 'm-auto max-h-[90dvh] w-[min(100%-2rem,40rem)]';

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`${placement} overflow-y-auto overscroll-contain rounded-lg border border-steel-700 bg-navy-900 p-0 text-steel-100 shadow-2xl backdrop:bg-navy-950/85 backdrop:backdrop-blur-sm`}
    >
      {children}
    </dialog>
  );
}