"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  ArrowUpRight,
  Bell,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
} from "lucide-react";
import AtlasNavigation from "./AtlasNavigation";
import AccessibleDialog from "./AccessibleDialog";

type View = string;
type SearchResult = {
  section: string;
  view: View;
  id: string;
  title: string;
  summary: string;
};

type AtlasHeaderProps = {
  activeView: View;
  navigationItems: Array<[View, string]>;
  navigate: (view: View) => void;
  theme: string;
  setTheme: (theme: string) => void;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  globalSearchSection: string;
  setGlobalSearchSection: (value: string) => void;
  globalSearchError: string;
  globalSearchResults: SearchResult[];
  globalSearchSections: string[];
  globalSearchLoading: boolean;
  todayIst: string;
};

export default function AtlasHeader({
  activeView,
  navigationItems,
  navigate,
  theme,
  setTheme,
  menuOpen,
  setMenuOpen,
  globalSearchOpen,
  setGlobalSearchOpen,
  globalSearch,
  setGlobalSearch,
  globalSearchSection,
  setGlobalSearchSection,
  globalSearchError,
  globalSearchResults,
  globalSearchSections,
  globalSearchLoading,
  todayIst,
}: AtlasHeaderProps) {
  const openResult = (result: SearchResult) => {
    sessionStorage.setItem("raksha-search-query", globalSearch.trim());
    sessionStorage.setItem("raksha-search-target", result.id);
    sessionStorage.setItem("raksha-search-section", result.section);
    if (result.view === "pipeline") {
      sessionStorage.setItem("raksha-search-mode", "pipeline");
    }
    navigate(result.view);
    setGlobalSearchOpen(false);
  };

  return (
    <>
      <header className="topbar">
        <button className="brand brand-button" onClick={() => navigate("overview")}>
          <div className="brand-mark">
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div>
            <strong>RAKSHA</strong>
            <span>ATLAS / 01</span>
          </div>
        </button>
        <AtlasNavigation activeView={activeView} items={navigationItems} onNavigate={navigate} />
        <div className="top-actions">
          <button
            className="global-search-trigger"
            aria-keyshortcuts="Control+K Meta+K"
            onClick={() => {
              setGlobalSearchOpen(true);
              setGlobalSearch("");
              setGlobalSearchSection("all");
            }}
            aria-label="Search Raksha Atlas"
          >
            <Search size={16} /><span>Search Atlas</span><kbd>⌘ K</kbd>
          </button>
          <button
            className="icon-btn theme-toggle"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="icon-btn" aria-label="Open PIB releases" onClick={() => navigate("pib")}>
            <Bell size={17} />
          </button>
          <button
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={18} />
          </button>
        </div>
        {menuOpen && (
          <AtlasNavigation mobile activeView={activeView} items={navigationItems} onNavigate={navigate} />
        )}
      </header>
      {globalSearchOpen && (
        <AccessibleDialog
          onClose={() => setGlobalSearchOpen(false)}
          ariaLabel="Search Raksha Atlas"
          contentClassName="atlas-search-dialog"
          backdropClassName="atlas-search-backdrop"
        >
          <div className="atlas-search-input">
            <Search size={19} />
            <input
              aria-label="Search all Raksha Atlas records"
              autoFocus
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search AMCA, Apache, destroyer, Tejas…"
              onKeyDown={(event) => {
                if (event.key === "Enter" && globalSearchResults[0]) {
                  openResult(globalSearchResults[0]);
                }
              }}
            />
            <kbd>ESC</kbd>
          </div>
          <div className="atlas-search-hint" aria-live="polite" aria-atomic="true">
            {globalSearch.trim().length < 2
              ? "Search inventory, commands, programmes, news, procurement, sources and geography"
              : globalSearchLoading
                ? "Searching across Raksha Atlas…"
                : `${globalSearchResults.length} results · ${globalSearchSection === "all" ? "All sections" : globalSearchSection}`}
          </div>
          {globalSearch.trim().length >= 2 && (
            <div className="atlas-search-filters">
              <button
                className={globalSearchSection === "all" ? "active" : ""}
                onClick={() => setGlobalSearchSection("all")}
              >
                All sections
              </button>
              {globalSearchSections.map((section) => (
                <button
                  key={section}
                  className={globalSearchSection === section ? "active" : ""}
                  onClick={() => setGlobalSearchSection(section)}
                >
                  {section}
                </button>
              ))}
            </div>
          )}
          {globalSearch.trim().length < 2 ? (
            <div className="atlas-search-links">
              {navigationItems.map(([view, label]) => (
                <button
                  key={view}
                  onClick={() => {
                    navigate(view);
                    setGlobalSearchOpen(false);
                  }}
                >
                  <span>{label}</span><small>{view}</small><ArrowUpRight size={14} />
                </button>
              ))}
            </div>
          ) : (
            <div className="atlas-search-results">
              {globalSearchResults.map((result, index) => (
                <button key={result.view + "-" + result.id + "-" + index} onClick={() => openResult(result)}>
                  <span className="atlas-result-section">{result.section}</span>
                  <strong>{result.title}</strong>
                  <small>{result.summary || "Open this record"}</small>
                  <ArrowUpRight size={14} />
                </button>
              ))}
              {globalSearchError && <div className="atlas-search-empty">{globalSearchError}</div>}
              {!globalSearchLoading && !globalSearchError && globalSearchResults.length === 0 && (
                <div className="atlas-search-empty">
                  No matching records. Try a full platform name, acronym or a broader term.
                </div>
              )}
            </div>
          )}
          <div className="atlas-search-footer">
            Results are ranked by title relevance and matching fields · Enter opens the first result
          </div>
        </AccessibleDialog>
      )}
      <div className="command-strip">
        <span><i className="strip-status" /> SYSTEM ONLINE</span>
        <span>PUBLIC DATA NETWORK</span>
        <span>OPEN-SOURCE / INDIA</span>
        <strong>{todayIst} · IST</strong>
      </div>
    </>
  );
}
