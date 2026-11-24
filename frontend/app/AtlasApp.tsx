"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { resolvePath, resolveView } from "../lib/routes.mjs";

const App = dynamic(() => import("../../src/App"), {
  ssr: false,
  loading: () => (
    <main className="app-loading" role="status" aria-live="polite">
      Loading Raksha Atlas…
    </main>
  ),
});

export default function AtlasApp() {
  const pathname = usePathname();
  const router = useRouter();
  const initialView = resolveView(pathname);

  if (!initialView) {
    return (
      <main className="page-section" role="main">
        <div className="page-hero">
          <span className="section-kicker">404 / ROUTE NOT FOUND</span>
          <h1>That page is <em>not in the atlas.</em></h1>
          <p>The address may be outdated or the page may have moved.</p>
          <a className="primary-btn" href="/">Return to overview</a>
        </div>
      </main>
    );
  }

  return (
    <App
      initialView={initialView}
      onNavigate={(view) => router.push(resolvePath(view))}
    />
  );
}
