# Peer Review Record

## Review Purpose

This peer review records the security review of the Week 5 vulnerability scanner and security-gate implementation.

The review focuses on whether the implementation demonstrates the required:

> **Detect → Fix → Verify → Enforce → Document**

security workflow.

## Scope Reviewed

The following project components were reviewed:

* `tools/vulnerability_scanner.py`
* `tools/vulnerability_scanner_ai_draft.py`
* `training-fixtures/vulnerable.js`
* `training-fixtures/fixed.js`
* `training-fixtures/missed.js`
* `training-fixtures/jwt-weak.js`
* `.github/workflows/security-scan.yml`
* scanner evidence under `artifacts/`
* `scanner-review.md`

## Review Findings

### Finding 1 — Scanner detects vulnerable training code

The vulnerable fixture produces HIGH-severity findings.

Observed rules include:

```text
SEC001
AUTH001
SQL001
```

The scanner returns:

```text
vulnerable_exit=1
```

This demonstrates that a HIGH finding can cause the local security gate to fail.

**Review status:** Confirmed.

---

### Finding 2 — Fixed fixture passes the scanner

The fixed fixture was scanned after remediation.

Observed result:

```text
No findings detected.
fixed_exit=0
```

The fixed fixture demonstrates:

* environment-based JWT secret configuration;
* server-side request validation; and
* parameterized SQL.

**Review status:** Confirmed.

---

### Finding 3 — EXEC001 improvement

The original AI-generated scanner did not provide a dedicated command/code-execution finding for the request-derived `exec()` pattern.

The improved scanner adds:

```text
EXEC001 — HIGH
```

and detects the pattern in:

```text
training-fixtures/missed.js
```

**Review status:** Confirmed.

---

### Finding 4 — JWT001 improvement

The improved scanner adds:

```text
JWT001 — HIGH
```

for literal JWT signing secrets.

The pattern is demonstrated in:

```text
training-fixtures/jwt-weak.js
```

**Review status:** Confirmed.

---

### Finding 5 — Static-analysis limitations

The scanner uses regular expressions, nearby source context, and heuristic analysis.

It does not provide complete interprocedural data-flow or taint analysis.

Therefore, a clean result must not be interpreted as proof that the application contains no vulnerabilities.

**Review status:** Accepted limitation.

---

## Workflow Review

The GitHub Actions workflow was reviewed for the following properties:

* execution on pushes to `main`;
* execution on pull requests targeting `main`;
* Python environment setup;
* execution of the vulnerability scanner;
* preservation of the scanner's exit code through `pipefail`;
* artifact upload when the scanner fails.

The workflow is designed so that the scanner's actual exit code determines the security job result.

**Review status:** Confirmed locally.

## Evidence Reviewed

Local evidence includes:

```text
artifacts/step9-vulnerable.txt
artifacts/step9-vulnerable-exit.txt
artifacts/step9-fixed.txt
artifacts/step9-fixed-exit.txt
artifacts/medusa-scan-findings.txt
artifacts/medusa-scan-exit-code.txt
artifacts/medusa-scan-findings-final.txt
artifacts/medusa-scan-exit-code-final.txt
```

The vulnerable/fixed comparison demonstrates:

```text
Vulnerable → HIGH findings → exit 1
Fixed      → No findings   → exit 0
```

## Outstanding Verification

At the time of this review, the GitHub Actions workflow has been prepared and validated locally, but the final GitHub-hosted workflow run remains dependent on the Step 10 repository connection and push.

Therefore, GitHub-hosted success/failure evidence should be added to the repository after the workflow has executed.

## Review Conclusion

The implementation demonstrates the intended local security-gate behavior.

The scanner identifies the intentionally vulnerable training patterns, the fixed fixture passes the scanner, and the GitHub Actions workflow is configured to use the scanner's actual exit code as the security gate.

The principal limitation is that the scanner is heuristic rather than a complete static-analysis engine.

The implementation should therefore be treated as one layer of a broader application security process rather than a complete vulnerability-detection solution.