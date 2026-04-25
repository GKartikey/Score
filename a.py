# =========================
# FINAL STABLE PIPELINE (NO BREAKS)
# =========================

import pandas as pd
import numpy as np
import re

# ---- 1. LOAD DATA ----
df = pd.read_csv("loan.csv", low_memory=False)

# ---- 2. FILTER TARGET ----
df = df[df['loan_status'].isin(['Fully Paid', 'Charged Off'])]

# ---- 3. REDUCE DATA ----
df = df.sample(n=50000, random_state=42).reset_index(drop=True)

# ---- 4. SELECT FEATURES ----
selected_cols = [
    'loan_amnt','term','int_rate','installment','grade','sub_grade',
    'emp_length','home_ownership','annual_inc','purpose',
    'dti','revol_util','total_acc','loan_status'
]
df = df[selected_cols]

# ---- 5. TARGET ----
df['target'] = (df['loan_status'] == 'Charged Off').astype(int)
df.drop('loan_status', axis=1, inplace=True)

# ---- 6. CLEAN PERCENT FIELDS ----
df['int_rate'] = pd.to_numeric(
    df['int_rate'].astype(str).str.replace('%','', regex=False),
    errors='coerce'
)
df['revol_util'] = pd.to_numeric(
    df['revol_util'].astype(str).str.replace('%','', regex=False),
    errors='coerce'
)

# ---- 7. DROP NA ----
df.dropna(inplace=True)

# ---- 8. ENCODE ----
df = pd.get_dummies(df, drop_first=True)

# ---- 9. SPLIT ----
from sklearn.model_selection import train_test_split

X = df.drop('target', axis=1)
y = df['target']

# ---- HARD FIX: CLEAN ALL COLUMN NAMES ----
def clean_col(c):
    c = str(c)
    c = re.sub(r'[^0-9a-zA-Z_]+', '_', c)   # replace EVERYTHING bad
    return c

X.columns = [clean_col(c) for c in X.columns]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ---- 10. MODEL (FORCE RANDOM FOREST - STABLE) ----
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=120,
    random_state=42,
    class_weight='balanced',   # fixes recall issue
    n_jobs=-1
)

model.fit(X_train, y_train)

# ---- 11. EVALUATION ----
from sklearn.metrics import classification_report, roc_auc_score

# default predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:,1]

print("\n=== DEFAULT THRESHOLD (0.5) ===")
print(classification_report(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_prob))

# ---- 12. IMPROVE RECALL (IMPORTANT) ----
# lower threshold → catch more defaulters
threshold = 0.3
y_pred_adj = (y_prob > threshold).astype(int)

print("\n=== LOWER THRESHOLD (0.3) ===")
print(classification_report(y_test, y_pred_adj))

# ---- 13. SIMPLE FEATURE IMPORTANCE (NO SHAP NEEDED) ----
importances = pd.Series(model.feature_importances_, index=X.columns)
print("\nTop 10 Important Features:")
print(importances.sort_values(ascending=False).head(10))

# ---- 14. SAVE MODEL ----
import pickle

with open("credit_risk_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("\nModel saved as credit_risk_model.pkl")