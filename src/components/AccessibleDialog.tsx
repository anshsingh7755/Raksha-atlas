"use client";

import { useEffect, useRef, type ReactNode } from "react";

function AccessibleDialog({
  children,
  onClose,
  labelledBy,
  ariaLabel,
  contentClassName,
  backdropClassName = "modal-backdrop",
  dismissOnBackdrop = true,
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  ariaLabel?: string;
  contentClassName: string;
  backdropClassName?: string;
  dismissOnBackdrop?: boolean;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement : null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    (first ?? dialog)?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const firstItem = focusable[0];
      const lastItem = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, []);
  return (
    <div
      className={backdropClassName}
      onMouseDown={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) closeRef.current();
      }}
    >
      <section
        ref={dialogRef}
        className={contentClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={ariaLabel}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );
}

export default AccessibleDialog;
