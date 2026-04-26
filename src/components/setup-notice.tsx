interface SetupNoticeProps {
  title: string;
  body: string;
  lines: string[];
}

export function SetupNotice({ title, body, lines }: SetupNoticeProps) {
  return (
    <section className="page-shell">
      <div className="panel loading-panel setup-panel">
        <span className="eyebrow">Setup Needed</span>
        <h1>{title}</h1>
        <p className="lede">{body}</p>
        <code className="snippet">{lines.join("\n")}</code>
      </div>
    </section>
  );
}
