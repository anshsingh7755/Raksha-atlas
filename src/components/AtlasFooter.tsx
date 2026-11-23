import { Clock3, Shield } from "lucide-react";

type AtlasFooterProps = {
  onNavigate: (view: string) => void;
};

export default function AtlasFooter({ onNavigate }: AtlasFooterProps) {
  return (
    <footer className="footer">
      <button className="brand brand-button" onClick={() => onNavigate("overview")}>
        <div className="brand-mark">
          <Shield size={16} />
        </div>
        <div>
          <strong>RAKSHA</strong>
          <span>ATLAS / 01</span>
        </div>
      </button>
      <p>Public information. Clear context. No classified material.</p>
      <span>
        <Clock3 size={12} /> PIB metadata sync target: 04:00 IST
      </span>
    </footer>
  );
}
