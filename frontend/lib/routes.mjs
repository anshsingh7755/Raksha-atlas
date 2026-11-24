export const pathToView = Object.freeze({
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
});

export const viewToPath = Object.freeze(
  Object.fromEntries(
    Object.entries(pathToView).map(([path, view]) => [view, path]),
  ),
);

export function resolveView(pathname) {
  return pathToView[pathname] ?? null;
}

export function resolvePath(view) {
  return viewToPath[view] ?? "/";
}
