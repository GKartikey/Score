const GRADE_RISK = {
  A: -0.18,
  B: -0.08,
  C: 0.02,
  D: 0.12,
  E: 0.23,
  F: 0.34,
  G: 0.44
};

const PURPOSE_RISK = {
  credit_card: -0.04,
  debt_consolidation: 0.04,
  home_improvement: -0.02,
  major_purchase: 0,
  medical: 0.08,
  small_business: 0.14,
  car: -0.04,
  house: 0.03,
  moving: 0.08,
  vacation: 0.06,
  other: 0.04
};

const HOME_RISK = {
  MORTGAGE: -0.05,
  OWN: -0.03,
  RENT: 0.04,
  OTHER: 0.07
};

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function addFactor(factors, label, value, detail) {
  factors.push({
    label,
    impact: Number(value.toFixed(3)),
    direction: value >= 0 ? "increases risk" : "reduces risk",
    detail
  });
}

function decisionFromProbability(probability) {
  if (probability >= 0.62) {
    return {
      band: "High risk",
      action: "Manual review required",
      color: "danger"
    };
  }

  if (probability >= 0.38) {
    return {
      band: "Moderate risk",
      action: "Approve with conditions",
      color: "warning"
    };
  }

  return {
    band: "Low risk",
    action: "Eligible for approval",
    color: "success"
  };
}

export function scoreApplication(rawApplication) {
  const application = {
    applicantName: rawApplication.applicantName || "",
    loan_amnt: number(rawApplication.loan_amnt, 15000),
    term: rawApplication.term || "36 months",
    int_rate: number(rawApplication.int_rate, 13),
    installment: number(rawApplication.installment, 350),
    grade: rawApplication.grade || "C",
    sub_grade: rawApplication.sub_grade || "C1",
    emp_length: rawApplication.emp_length || "5 years",
    home_ownership: rawApplication.home_ownership || "RENT",
    annual_inc: number(rawApplication.annual_inc, 65000),
    purpose: rawApplication.purpose || "debt_consolidation",
    dti: number(rawApplication.dti, 18),
    revol_util: number(rawApplication.revol_util, 42),
    total_acc: number(rawApplication.total_acc, 24)
  };

  const factors = [];
  let logit = -1.25;

  const dtiImpact = clamp((application.dti - 18) / 45, -0.28, 0.36);
  logit += dtiImpact * 2.1;
  addFactor(factors, "Debt-to-income ratio", dtiImpact, `${application.dti}% DTI compared with a 18% baseline`);

  const utilizationImpact = clamp((application.revol_util - 40) / 100, -0.22, 0.32);
  logit += utilizationImpact * 1.8;
  addFactor(factors, "Revolving utilization", utilizationImpact, `${application.revol_util}% utilization`);

  const incomePerLoan = application.annual_inc / Math.max(application.loan_amnt, 1);
  const affordabilityImpact = clamp((2.8 - incomePerLoan) / 2.4, -0.35, 1.15);
  logit += affordabilityImpact * 2.2;
  addFactor(factors, "Income coverage", affordabilityImpact, `${incomePerLoan.toFixed(1)}x annual income to requested loan`);

  const paymentBurden = (application.installment * 12) / Math.max(application.annual_inc, 1);
  const paymentBurdenImpact = clamp((paymentBurden - 0.18) * 1.7, -0.18, 0.8);
  logit += paymentBurdenImpact * 1.7;
  addFactor(
    factors,
    "Installment burden",
    paymentBurdenImpact,
    `${Math.round(paymentBurden * 100)}% of annual income used by scheduled payments`
  );

  const interestImpact = clamp((application.int_rate - 12) / 40, -0.18, 0.3);
  logit += interestImpact * 1.6;
  addFactor(factors, "Interest rate signal", interestImpact, `${application.int_rate}% quoted rate`);

  const gradeImpact = GRADE_RISK[application.grade] ?? 0.02;
  logit += gradeImpact * 1.9;
  addFactor(factors, "Credit grade", gradeImpact, `Grade ${application.sub_grade || application.grade}`);

  const termImpact = application.term.includes("60") ? 0.12 : -0.04;
  logit += termImpact;
  addFactor(factors, "Loan term", termImpact, application.term);

  const homeImpact = HOME_RISK[application.home_ownership] ?? HOME_RISK.OTHER;
  logit += homeImpact;
  addFactor(factors, "Home ownership", homeImpact, application.home_ownership);

  const purposeImpact = PURPOSE_RISK[application.purpose] ?? PURPOSE_RISK.other;
  logit += purposeImpact;
  addFactor(factors, "Loan purpose", purposeImpact, application.purpose.replaceAll("_", " "));

  const totalAccountsImpact = clamp((18 - application.total_acc) / 120, -0.08, 0.1);
  logit += totalAccountsImpact;
  addFactor(factors, "Credit history breadth", totalAccountsImpact, `${application.total_acc} total accounts`);

  const probability = clamp(sigmoid(logit), 0.03, 0.94);
  const decision = decisionFromProbability(probability);
  const sortedFactors = factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    application,
    probability: Number(probability.toFixed(4)),
    score: Math.round((1 - probability) * 850),
    decision,
    factors: sortedFactors,
    complianceNotes: [
      "Decision generated from declared borrower and loan attributes.",
      "Top contributing factors are preserved for adverse-action review.",
      "Every score response is written to the audit trail when storage is available."
    ],
    model: {
      name: "Explainable credit risk scorer",
      trainingReference: "loan.csv / a.py RandomForest feature set",
      explainability: "Deterministic contribution model aligned to selected training fields"
    }
  };
}
