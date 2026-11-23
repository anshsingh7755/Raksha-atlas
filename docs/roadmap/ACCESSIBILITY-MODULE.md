# UX and accessibility — Phase 0.9

## Scope delivered

Phase 0.9 improves keyboard and assistive-technology behavior in the existing React/Vite interface without changing the visual design system or replacing the current application stack.

### Keyboard navigation

- A skip link appears as the first interactive element and moves keyboard users directly to the main content.
- Primary navigation exposes the active page through `aria-current="page"`.
- The mobile menu trigger exposes its expanded state and controls the mobile navigation region.
- The global search shortcut advertises its supported keyboard shortcuts.

### Dialog behavior

A shared `AccessibleDialog` wrapper is used by the assistant, global search, programme details, document details and source-candidate composer.

It provides:
- `role="dialog"`, `aria-modal="true"` and an accessible label/title.
- Initial focus on the first available control.
- Tab and Shift+Tab focus containment.
- Escape-key dismissal.
- Focus restoration to the element that opened the dialog.
- Optional backdrop dismissal, disabled while the source composer is saving.

### Dynamic status announcements

- Assistant retrieval/loading/answer state is exposed through a polite live region.
- Global search result counts and loading state are announced through a polite, atomic live region.

### Visual accessibility

- Existing visible keyboard focus styles are retained.
- A dedicated skip-link style is provided.
- Forced-colors mode receives a system-highlight focus outline and system-color skip-link treatment.
- Existing reduced-motion styles remain in place.

## Manual verification checklist

Run the application and verify:

1. Press Tab immediately after page load; the first focusable element is “Skip to main content”.
2. Activate it; focus moves to the main content landmark.
3. Navigate primary navigation using Tab/Enter; the current page is exposed as current.
4. Open the assistant, global search, programme detail, document detail and source composer using keyboard controls.
5. On each dialog, focus starts inside the dialog; Tab and Shift+Tab stay within it.
6. Escape closes the dialog and restores focus to its opener.
7. Backdrop click closes dialogs where enabled; it does not close the source composer while saving.
8. Search result counts and assistant loading/answer changes are announced by a screen reader.
9. Enable Windows High Contrast / forced-colors mode and confirm keyboard focus remains visible.
10. Enable reduced motion and confirm non-essential animation is suppressed.

## Known limitations

- This is a focused accessibility pass, not a claim of WCAG 2.2 AA conformance.
- A full audit with NVDA/VoiceOver, keyboard-only use, zoom/reflow, contrast measurement and automated axe/Lighthouse checks remains required.
- Some data tables and complex visualisations need dedicated caption/summary and keyboard interaction reviews.
- The application still needs broader form validation/error association and landmark review.

## Validation

```powershell
npm test
npm run build
```

CI verifies compilation and existing automated tests. The manual checklist above is required for browser and assistive-technology validation.
