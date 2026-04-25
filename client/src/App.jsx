import { useEffect, useMemo, useState } from "react";
import { Activity, BadgeCheck, Database, FileText, Landmark, ShieldCheck } from "lucide-react";
import { fetchAudits, scoreApplication } from "./api.js";
import { ApplicationForm } from "./components/ApplicationForm.jsx";
import { AuditTrail } from "./components/AuditTrail.jsx";
import { ResultPanel } from "./components/ResultPanel.jsx";

const starterApplication = {
  applicantName: "Aarav Sharma",
  loan_amnt: 18000,
  term: "36 months",
  int_rate: 13.56,
  installment: 611,
  grade: "C",
  sub_grade: "C1",
  emp_length: "10+ years",
  home_ownership: "RENT",
  annual_inc: 72000,
  purpose: "debt_consolidation",
  dti: 19.8,
  revol_util: 45,
  total_acc: 28
};

export default function App() {
  const [application, setApplication] = useState(starterApplication);
  const [result, setResult] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAudits() {
    try {
      const records = await fetchAudits();
      setAudits(records);
    } catch (auditError) {
      setAudits([]);
    }
  }

  useEffect(() => {
    loadAudits();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const scored = await scoreApplication(application);
      setResult(scored);
      await loadAudits();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const highRisk = audits.filter((item) => item.result?.decision?.band === "High risk").length;
    const avgProbability =
      audits.length === 0
        ? 0
        : audits.reduce((sum, item) => sum + Number(item.result?.probability || 0), 0) / audits.length;

    return {
      decisions: audits.length,
      highRisk,
      avgProbability: Math.round(avgProbability * 100)
    };
  }, [audits]);

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Banking, FinTech, interpretability and compliance</p>
          <h1>Credit Risk Scoring System</h1>
        </div>
        <div className="brand-mark">
          <Landmark size={22} />
          <span>RiskOps</span>
        </div>
      </section>

      <section className="metrics" aria-label="Portfolio metrics">
        <article>
          <Activity size={20} />
          <span>{stats.decisions}</span>
          <p>Audited decisions</p>
        </article>
        <article>
          <ShieldCheck size={20} />
          <span>{stats.avgProbability}%</span>
          <p>Average default risk</p>
        </article>
        <article>
          <FileText size={20} />
          <span>{stats.highRisk}</span>
          <p>Manual reviews</p>
        </article>
        <article>
          <Database size={20} />
          <span>MERN</span>
          <p>API and audit store</p>
        </article>
      </section>

      <section className="workspace">
        <ApplicationForm
          application={application}
          error={error}
          loading={loading}
          onChange={setApplication}
          onSubmit={handleSubmit}
        />
        <ResultPanel result={result} />
      </section>

      <section className="compliance-band">
        <BadgeCheck size={24} />
        <div>
          <h2>Explainable by design</h2>
          <p>
            Each score includes factor-level reasoning, preserved inputs, and a decision record for
            regulator or credit committee review.
          </p>
        </div>
      </section>

      <AuditTrail audits={audits} />
    </main>
  );
}
