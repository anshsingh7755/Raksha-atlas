"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";

const App = dynamic(() => import("../../src/App"), {
  ssr: false,
  loading: () => <main className="app-loading" aria-live="polite">Loading Raksha Atlas…</main>,
});

const pathToView: Record<string, string> = {
  "/": "overview",
  "/commands": "forces",
  "/theatre-atlas": "atlas",
  "/inventory": "inventory",
  "/programmes": "programmes",
  "/articles": "signals",
  "/briefs": "briefs",
  "/documents": "documents",
  "/sources": "sources",
  "/procurement": "pipeline",
  "/timeline": "timeline",
  "/watch": "watch",
  "/pib": "pib",
  "/register": "register",
  "/history": "history",
};

const viewToPath = Object.fromEntries(
  Object.entries(pathToView).map(([path, view]) => [view, path]),
) as Record<string, string>;

export default function AtlasApp() {
  const pathname = usePathname();
  const router = useRouter();
  const initialView = pathToView[pathname] ?? "overview";

  return (
    <App
      initialView={initialView}
      onNavigate={(view) => router.push(viewToPath[view] ?? "/")}
    />
  );
}
