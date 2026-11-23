import type { ReactNode } from "react";

type SectionTitleProps = {
  kicker: string;
  title: ReactNode;
  action?: ReactNode;
};

export default function SectionTitle({
  kicker,
  title,
  action,
}: SectionTitleProps) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
