# Clinical Safety Engine: Thresholds & Medical Review Guide

> **MANDATORY NOTICE**:
> `critical-thresholds.json` contains baseline clinical safety boundaries designed to protect patients from dangerous misinterpretations. **Every threshold, test alias, and advice string in that file MUST BE REVIEWED, VALIDATED, AND SIGNED OFF BY A LICENSED PHYSICIAN (MD/MBBS)** before the application is deployed to real users or patient populations.

---

## 1. Safety Architecture Overview

ReportSaathi uses a **two-tier clinical triage model**:
1. **Deterministic Rules Engine (`apps/api/src/safety/engine.ts`)**: Evaluates raw printed laboratory values and ranges using mathematical deviation formulas and hard critical limits. The rules engine runs **before** and **after** the LLM.
2. **LLM Ratchet Rule**: The LLM is permitted to elevate clinical urgency (e.g., from `routine` to `soon` or `soon` to `urgent` if multi-parameter symptoms warrant it), but the rules engine **strictly prevents the LLM from lowering the urgency** below what the deterministic rules calculated.

```
+-----------------------------------------------------------+
| Lab Report Upload (Values + Printed Ranges Extracted)     |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
| 1. Deterministic Evaluation (engine.ts)                   |
|    - Compare value vs printed reference range             |
|    - Compute % deviation (|val - boundary| / rangeWidth)   |
|    - Check Critical Test boundaries (critical-thresholds) |
|    --> Produces baseline doctorVisit.level:               |
|        'routine' | 'soon' | 'urgent'                      |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
| 2. LLM Synthesis (ExplanationLLM with 8 Safety Rules)     |
|    - Explains in patient's preferred Indic language       |
|    - Proposes doctorVisit.level                           |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
| 3. Post-Synthesis Ratchet & Safety Filter (post-filter.ts)|
|    - Math check: finalLevel = max(ruleLevel, llmLevel)    |
|    - Dosage regex check (blocks '500mg', '10ml', etc.)    |
|    - Medicine denylist check (blocks named pharmaceuticals)|
|    - 112 emergency routing if acute distress is detected  |
+-----------------------------------------------------------+
```

---

## 2. Threshold Rationales

### 2.1 General Deviation Rules
- **Normal (`routine`)**: All measured values sit within the printed laboratory reference range.
- **Moderate Deviation (`soon` - Default: 30%)**:
  - A value deviating by $\ge 30\%$ beyond the reference range boundary indicates a meaningful physiological shift that warrants medical consultation, but without acute life-threatening risk in the absence of severe symptoms.
  - Advised action: Schedule an appointment within a few days or next week.
- **Severe Deviation (`urgent` - Default: 60%)**:
  - A value deviating by $\ge 60\%$ beyond the reference range represents an extreme outlier that demands urgent clinical evaluation.

---

### 2.2 Critical Analyte Boundaries

| Analyte | Normal Range | Critical Thresholds | Clinical Hazard / Rationale |
| :--- | :--- | :--- | :--- |
| **Cardiac Troponin (I / T)** | Undetectable / $< 0.04$ ng/mL | Any elevation above upper reference limit | High specificity for myocardial injury / acute coronary syndrome (ACS). Immediate emergency department referral. |
| **Serum Potassium ($K^+$)** | $3.5 - 5.1$ mmol/L | $< 2.8$ or $> 6.2$ mmol/L | Cardiac arrhythmogenic risk. Severe hypokalemia or hyperkalemia can trigger fatal ventricular arrhythmias and cardiac arrest. |
| **Hemoglobin (Hb)** | $12.0 - 16.0$ g/dL | $< 7.0$ or $> 20.0$ g/dL | Severe anemia ($< 7.0$ g/dL) impairs oxygen delivery to vital organs, potentially causing high-output cardiac failure. Severe polycythemia ($> 20.0$) increases blood viscosity and thrombotic risk. |
| **Platelet Count** | $150,000 - 450,000$ /mcL | $< 30,000$ or $> 1,000,000$ /mcL | Severe thrombocytopenia ($< 30,000$) risks spontaneous mucocutaneous and intracranial bleeding. Thrombocytosis ($> 1,000,000$) increases vascular thrombosis risk. |
| **Fasting Blood Glucose** | $70 - 99$ mg/dL | $< 50$ or $> 350$ mg/dL | Hypoglycemia ($< 50$ mg/dL) causes neuroglycopenia, seizures, and coma. Extreme hyperglycemia ($> 350$) risks Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS). |
| **Serum Creatinine** | $0.6 - 1.2$ mg/dL | $> 4.0$ mg/dL | Acute Kidney Injury (AKI) or decompensated chronic kidney disease. Risks uremic encephalopathy, hyperkalemia, and fluid overload. |

---

## 3. Physician Sign-off & Verification Checklist

Prior to production launch, the designated Chief Medical Officer or Clinical Reviewer must complete the following steps:
1. [ ] Validate all test aliases against the local laboratory information system (LIS) report formats.
2. [ ] Review critical analyte cutoffs against institutional hospital protocols and ICMR (Indian Council of Medical Research) / local health authority guidelines.
3. [ ] Confirm appropriate emergency phone numbers: `112` (National Emergency Number in India) and hospital emergency triage direct line.
4. [ ] Sign and date this document in the record below:

| Review Date | Reviewing Physician | Registration / License # | Signature / Approval ID |
| :--- | :--- | :--- | :--- |
| *Pending* | *[Dr. Full Name]* | *[State Medical Council #]* | *[Digital Signature]* |
