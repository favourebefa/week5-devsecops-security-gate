# Week 5 — DevSecOps Security Gate Dossier

## Overview

This project demonstrates a basic DevSecOps security workflow:

> **Detect → Fix → Verify → Enforce → Document**

The objective is to demonstrate that a vulnerability can be detected by a local security scanner, remediated using secure coding practices, verified through a clean scan, and enforced through GitHub Actions.

The project uses intentionally vulnerable classroom training fixtures. These files are for security testing and must not be deployed as production code.

---

## Repository Structure

```text
week5-secure-core/
├── .github/
│   └── workflows/
│       └── security-scan.yml
│
├── artifacts/
│   ├── scanner-findings.txt
│   ├── medusa-scan-findings.txt
│   ├── medusa-scan-exit-code.txt
│   ├── medusa-scan-findings-final.txt
│   ├── medusa-scan-exit-code-final.txt
│   ├── step9-vulnerable.txt
│   ├── step9-vulnerable-exit.txt
│   ├── step9-fixed.txt
│   └── step9-fixed-exit.txt
│
├── tools/
│   ├── vulnerability_scanner.py
│   └── vulnerability_scanner_ai_draft.py
│
├── training-fixtures/
│   ├── vulnerable.js
│   ├── fixed.js
│   ├── missed.js
│   └── jwt-weak.js
│
├── scanner-review.md
├── Security-Policy.md
├── Control-Register.md
├── Peer-Review.md
└── README.md
```

---

## 1. Vulnerability Detection

The improved vulnerability scanner is located at:

```text
tools/vulnerability_scanner.py
```

The scanner uses pattern-based analysis to identify security issues in JavaScript and TypeScript source code.

Implemented rules include:

| Rule      | Severity | Purpose                                                     |
| --------- | -------- | ----------------------------------------------------------- |
| `SEC001`  | HIGH     | Detect potential hardcoded secrets or API keys              |
| `SQL001`  | HIGH     | Detect potentially unsafe SQL construction                  |
| `AUTH001` | HIGH     | Detect request input without visible server-side validation |
| `EXEC001` | HIGH     | Detect request-derived input reaching `exec()` or `eval()`  |
| `JWT001`  | HIGH     | Detect literal JWT signing secrets                          |

The original AI-generated scanner was preserved as:

```text
tools/vulnerability_scanner_ai_draft.py
```

The differences and limitations are documented in:

```text
scanner-review.md
```

---

## 2. Vulnerable Training Fixture

The intentionally vulnerable test file is:

```text
training-fixtures/vulnerable.js
```

It contains multiple patterns that the scanner is expected to detect, including:

* a hardcoded secret-like value;
* request input without visible validation; and
* unsafe SQL construction using string interpolation.

The vulnerable fixture is classroom test data only and must not be deployed.

### Vulnerable scan

Command:

```bash
python3 tools/vulnerability_scanner.py training-fixtures/vulnerable.js
```

Observed result:

```text
Summary: 3 finding(s) (3 HIGH)
vulnerable_exit=1
```

The scanner identified:

```text
SEC001 — HIGH
AUTH001 — HIGH
SQL001 — HIGH
```

The exit code of `1` causes the security check to fail when HIGH-severity findings are present.

Evidence:

```text
artifacts/step9-vulnerable.txt
artifacts/step9-vulnerable-exit.txt
```

---

## 3. Remediation

The fixed comparison fixture is:

```text
training-fixtures/fixed.js
```

The remediation applies secure coding practices:

### Environment-based secret configuration

Instead of placing a signing secret directly in source code, the fixed fixture uses:

```javascript
process.env.JWT_SECRET
```

This separates secret configuration from source code.

### Server-side input validation

The request parameter is explicitly checked before use:

```javascript
if (!req.query.q || typeof req.query.q !== "string") {
  return res.status(400).json({ error: "q is required" });
}
```

The input is also subject to a length restriction.

### Parameterized SQL

The vulnerable string-interpolated SQL pattern is replaced with a parameterized query:

```javascript
const query = "SELECT id, name FROM products WHERE name LIKE $1";
const rows = await db.query(query, [`%${term}%`]);
```

This prevents the user-controlled value from being directly incorporated into the SQL statement.

---

## 4. Verify the Fixed Code

The fixed fixture was scanned using:

```bash
python3 tools/vulnerability_scanner.py training-fixtures/fixed.js
printf 'fixed_exit=%s\n' "$?"
```

Observed result:

```text
No findings detected.
fixed_exit=0
```

This demonstrates the intended local security-gate behavior:

```text
Vulnerable code → HIGH findings → exit code 1
Fixed code      → No findings    → exit code 0
```

Evidence:

```text
artifacts/step9-fixed.txt
artifacts/step9-fixed-exit.txt
```

---

## 5. Medusa Backend Scan

As part of Step 8, the corrected scanner was also run against the Week 2 Medusa backend.

The project scanned was:

```text
week2-secure-core/ihifix-medusa-lab/my-medusa-store
```

The scanner reported:

```text
No findings detected.
medusa_scan_exit=0
```

The final scan also returned:

```text
No findings detected.
final_scan_exit=0
```

Evidence:

```text
artifacts/medusa-scan-findings.txt
artifacts/medusa-scan-exit-code.txt
artifacts/medusa-scan-findings-final.txt
artifacts/medusa-scan-exit-code-final.txt
```

A clean heuristic scan does not prove that the Medusa application is completely secure. It only means that the configured scanner rules did not recognize any findings.

Additional security activities such as dependency scanning, application testing, secret-history scanning, and manual review remain necessary.

---

## 6. GitHub Actions Security Gate

The GitHub Actions workflow is:

```text
.github/workflows/security-scan.yml
```

The workflow runs on:

* pushes to `main`;
* pull requests targeting `main`.

The scanner is executed with:

```bash
python3 tools/vulnerability_scanner.py .
```

The workflow uses `pipefail` so that the scanner's actual exit code is preserved when its output is passed through `tee`.

A HIGH finding therefore causes the scanner to return exit code `1`, which causes the GitHub Actions security-check step to fail naturally.

The workflow uploads scanner output as an artifact using:

```yaml
if: always()
```

This ensures that findings remain available even if the scanner fails the job.

---

## 7. Security Gate Logic

The security gate follows this model:

```text
Source code
     │
     ▼
Vulnerability scanner
     │
     ├── HIGH finding → exit 1 → security job fails
     │
     └── No HIGH finding → exit 0 → security job passes
```

The scanner does not use a hardcoded `exit 1` in the GitHub Actions workflow. The scanner's real result determines whether the job succeeds or fails.

---

## 8. Scanner Limitations

This scanner is a pattern-based security scanner rather than a complete static-analysis or data-flow analysis engine.

It may produce:

* false positives;
* false negatives;
* findings that require human review.

For example, validation may exist in middleware, another module, or a framework-specific mechanism that is not visible to the scanner's local analysis.

Similarly, `EXEC001` uses heuristic analysis to identify suspicious relationships between request-derived input and `exec()` or `eval()`. It does not provide complete interprocedural taint tracking.

Therefore:

> A clean scan is not proof that an application is secure.

Scanner findings should be reviewed and validated by a human.

---

## 9. Security Documentation

The security controls and governance documentation for this project are maintained in:

```text
Security-Policy.md
Control-Register.md
Peer-Review.md
```

These documents describe the security expectations, implemented controls, and review process associated with the security gate.

---

## 10. Reproduction

### Validate scanner syntax

```bash
python3 -m py_compile tools/vulnerability_scanner.py
```

Expected exit code:

```text
0
```

### Test vulnerable fixture

```bash
python3 tools/vulnerability_scanner.py training-fixtures/vulnerable.js
printf 'vulnerable_exit=%s\n' "$?"
```

Expected:

```text
HIGH findings
vulnerable_exit=1
```

### Test fixed fixture

```bash
python3 tools/vulnerability_scanner.py training-fixtures/fixed.js
printf 'fixed_exit=%s\n' "$?"
```

Expected:

```text
No findings detected.
fixed_exit=0
```

### Run recursive scan

```bash
python3 tools/vulnerability_scanner.py .
```

The scanner's exit code determines whether the security gate passes or fails.

---

## 11. Security and Secret Handling

No real credentials, passwords, API keys, private keys, database credentials, live tokens, or `.env` files should be committed to this repository.

The secrets used in the vulnerable training fixtures are intentionally fake classroom test values.

Real production secrets must be stored using appropriate environment-based configuration or a managed secret-management system.

---

## 12. Assignment Outcome

This project demonstrates the following security lifecycle:

```text
DETECT
  ↓
Scanner identifies HIGH-risk patterns
  ↓
FIX
  ↓
Vulnerable code is replaced with safer implementation
  ↓
VERIFY
  ↓
Fixed code produces exit code 0
  ↓
ENFORCE
  ↓
GitHub Actions uses the scanner exit code as a security gate
  ↓
DOCUMENT
  ↓
Evidence, policy, controls, peer review, and reproduction steps
```

The intentionally vulnerable code exists only to demonstrate that the security gate can detect and block insecure code. It must not be deployed as production code.