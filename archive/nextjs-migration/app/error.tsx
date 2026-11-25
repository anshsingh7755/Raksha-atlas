"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-section" role="alert" aria-live="assertive">
      <div className="page-hero">
        <span className="section-kicker">APPLICATION ERROR</span>
        <h1>Something went <em>wrong.</em></h1>
        <p>The page could not be rendered. Your existing records have not been changed.</p>
        {error.digest && <small>Reference: {error.digest}</small>}
        <button className="primary-btn" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
