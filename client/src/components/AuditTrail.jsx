import { Clock3 } from "lucide-react";

export function AuditTrail({ audits }) {
  return (
    <section className="audit-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Decision register</p>
          <h2>Audit trail</h2>
        </div>
      </div>

      <div className="audit-table">
        <div className="audit-row audit-head">
          <span>Applicant</span>
          <span>Decision</span>
          <span>Risk</span>
          <span>Time</span>
        </div>
        {audits.length === 0 ? (
          <div className="audit-empty">
            <Clock3 size={22} />
            <span>No decisions recorded yet.</span>
          </div>
        ) : (
          audits.map((audit) => (
            <div className="audit-row" key={audit._id}>
              <span>{audit.applicantName}</span>
              <span>{audit.result?.decision?.band}</span>
              <span>{Math.round(Number(audit.result?.probability || 0) * 100)}%</span>
              <span>{new Date(audit.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
