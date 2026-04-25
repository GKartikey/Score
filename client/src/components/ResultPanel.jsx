import { AlertTriangle, CheckCircle2, Scale, ShieldAlert } from "lucide-react";

function decisionIcon(color) {
  if (color === "danger") return <ShieldAlert size={22} />;
  if (color === "warning") return <AlertTriangle size={22} />;
  return <CheckCircle2 size={22} />;
}

export function ResultPanel({ result }) {
  if (!result) {
    return (
      <section className="panel result-empty">
        <Scale size={44} />
        <h2>Awaiting application</h2>
        <p>Run a borrower profile to receive a risk probability, score, decision band, and factor explanation.</p>
      </section>
    );
  }

  const percent = Math.round(result.probability * 100);

  return (
    <section className={`panel result-panel ${result.decision.color}`}>
      <div className="decision-header">
        <div className="decision-icon">{decisionIcon(result.decision.color)}</div>
        <div>
          <p className="eyebrow">Decision outcome</p>
          <h2>{result.decision.band}</h2>
          <p>{result.decision.action}</p>
        </div>
      </div>

      <div className="score-ring" style={{ "--risk": `${percent}%` }}>
        <div>
          <strong>{percent}%</strong>
          <span>default risk</span>
        </div>
      </div>

      <div className="score-row">
        <span>Credit score</span>
        <strong>{result.score}</strong>
      </div>

      <div className="factor-list">
        <h3>Top risk drivers</h3>
        {result.factors.slice(0, 6).map((factor) => (
          <article key={factor.label}>
            <div>
              <strong>{factor.label}</strong>
              <span>{factor.detail}</span>
            </div>
            <b className={factor.impact >= 0 ? "risk-up" : "risk-down"}>
              {factor.impact >= 0 ? "+" : ""}
              {factor.impact}
            </b>
          </article>
        ))}
      </div>

      <div className="notes">
        <h3>Compliance notes</h3>
        {result.complianceNotes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </section>
  );
}
