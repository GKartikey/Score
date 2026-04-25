import { Calculator, RefreshCw } from "lucide-react";

const grades = ["A", "B", "C", "D", "E", "F", "G"];
const terms = ["36 months", "60 months"];
const ownership = ["RENT", "MORTGAGE", "OWN", "OTHER"];
const purposes = [
  "debt_consolidation",
  "credit_card",
  "home_improvement",
  "major_purchase",
  "medical",
  "small_business",
  "car",
  "house",
  "moving",
  "vacation",
  "other"
];

export function ApplicationForm({ application, error, loading, onChange, onSubmit }) {
  function updateField(field, value) {
    onChange({
      ...application,
      [field]: value
    });
  }

  function numberField(field, value) {
    updateField(field, value === "" ? "" : Number(value));
  }

  return (
    <form className="panel application-form" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Borrower application</p>
          <h2>Score a loan</h2>
        </div>
        <button type="submit" disabled={loading} className="icon-button" title="Run score">
          {loading ? <RefreshCw className="spin" size={18} /> : <Calculator size={18} />}
        </button>
      </div>

      <label>
        Applicant
        <input value={application.applicantName} onChange={(event) => updateField("applicantName", event.target.value)} />
      </label>

      <div className="form-grid">
        <label>
          Loan amount
          <input
            min="1000"
            step="500"
            type="number"
            value={application.loan_amnt}
            onChange={(event) => numberField("loan_amnt", event.target.value)}
          />
        </label>
        <label>
          Annual income
          <input
            min="0"
            step="1000"
            type="number"
            value={application.annual_inc}
            onChange={(event) => numberField("annual_inc", event.target.value)}
          />
        </label>
        <label>
          Interest rate
          <input
            min="0"
            max="40"
            step="0.01"
            type="number"
            value={application.int_rate}
            onChange={(event) => numberField("int_rate", event.target.value)}
          />
        </label>
        <label>
          Installment
          <input
            min="0"
            step="1"
            type="number"
            value={application.installment}
            onChange={(event) => numberField("installment", event.target.value)}
          />
        </label>
        <label>
          DTI
          <input
            min="0"
            max="80"
            step="0.1"
            type="number"
            value={application.dti}
            onChange={(event) => numberField("dti", event.target.value)}
          />
        </label>
        <label>
          Revolving utilization
          <input
            min="0"
            max="150"
            step="0.1"
            type="number"
            value={application.revol_util}
            onChange={(event) => numberField("revol_util", event.target.value)}
          />
        </label>
        <label>
          Total accounts
          <input
            min="0"
            step="1"
            type="number"
            value={application.total_acc}
            onChange={(event) => numberField("total_acc", event.target.value)}
          />
        </label>
        <label>
          Employment length
          <input value={application.emp_length} onChange={(event) => updateField("emp_length", event.target.value)} />
        </label>
        <label>
          Term
          <select value={application.term} onChange={(event) => updateField("term", event.target.value)}>
            {terms.map((term) => (
              <option key={term}>{term}</option>
            ))}
          </select>
        </label>
        <label>
          Grade
          <select value={application.grade} onChange={(event) => updateField("grade", event.target.value)}>
            {grades.map((grade) => (
              <option key={grade}>{grade}</option>
            ))}
          </select>
        </label>
        <label>
          Sub-grade
          <input value={application.sub_grade} onChange={(event) => updateField("sub_grade", event.target.value)} />
        </label>
        <label>
          Home ownership
          <select
            value={application.home_ownership}
            onChange={(event) => updateField("home_ownership", event.target.value)}
          >
            {ownership.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Purpose
        <select value={application.purpose} onChange={(event) => updateField("purpose", event.target.value)}>
          {purposes.map((purpose) => (
            <option key={purpose} value={purpose}>
              {purpose.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary-action" type="submit" disabled={loading}>
        {loading ? "Scoring application" : "Generate risk decision"}
      </button>
    </form>
  );
}
