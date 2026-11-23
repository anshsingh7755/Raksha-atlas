type AtlasNavigationProps = {
  activeView: string;
  items: Array<[string, string]>;
  onNavigate: (view: string) => void;
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
