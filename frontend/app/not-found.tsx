import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-section">
      <div className="page-hero">
        <span className="section-kicker">404 / ROUTE NOT FOUND</span>
        <h1>That page is <em>not in the atlas.</em></h1>
        <p>The address may be outdated or the page may have moved.</p>
        <Link className="primary-btn" href="/">Return to overview</Link>
      </div>
    </main>
  );
}
