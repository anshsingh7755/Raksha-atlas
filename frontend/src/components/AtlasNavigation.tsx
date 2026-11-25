type View =
  | "overview"
  | "forces"
  | "atlas"
  | "programmes"
  | "pipeline"
  | "signals"
  | "sources"
  | "inventory"
  | "timeline"
  | "watch"
  | "pib"
  | "register"
  | "history"
  | "briefs"
  | "documents";

type AtlasNavigationProps = {
  activeView: View;
  items: Array<[View, string]>;
  onNavigate: (view: View) => void;
  mobile?: boolean;
};

export default function AtlasNavigation({
  activeView,
  items,
  onNavigate,
  mobile = false,
}: AtlasNavigationProps) {
  return (
    <nav
      className={mobile ? "mobile-nav" : "topnav"}
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
      id={mobile ? "mobile-navigation" : undefined}
    >
      {items.map(([item, label]) => (
        <button
          className={activeView === item ? "nav-link active" : "nav-link"}
          aria-current={activeView === item ? "page" : undefined}
          key={item}
          onClick={() => onNavigate(item)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
