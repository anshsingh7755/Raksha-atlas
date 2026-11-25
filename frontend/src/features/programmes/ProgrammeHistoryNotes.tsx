function ProgrammeHistoryNotes({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return <div className="programme-history-notes">{lines.map((raw, index) => {
    const line = raw.replace(/^-\s*/, "").replace(/\*\*/g, "");
    const splitAt = line.indexOf(":");
    const label = splitAt > 0 ? line.slice(0, splitAt).trim() : "";
    const value = splitAt > 0 ? line.slice(splitAt + 1).trim() : line;
    if (label.toLowerCase() === "primary discovery/source link") return null;
    return <div className="programme-history-note" key={index}>
      {label && <strong>{label}</strong>}
      <p>{value}</p>
    </div>;
  })}</div>;
}

export default ProgrammeHistoryNotes;
