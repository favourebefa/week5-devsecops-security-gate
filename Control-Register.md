# Security Control Register

## Purpose

This register maps the security controls implemented in the Week 5 project to the risks they address, the scanner rules that support them, and the available evidence.

| ID       | Security Control                           | Risk Addressed                              | Scanner Rule                   | Implementation / Evidence                                                                                          | Status      |
| -------- | ------------------------------------------ | ------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| CTRL-001 | Hardcoded secret detection                 | Credential exposure                         | `SEC001`                       | Scanner detects potential hardcoded secrets or API keys. Tested in `training-fixtures/vulnerable.js`.              | Implemented |
| CTRL-002 | Parameterized SQL                          | SQL injection                               | `SQL001`                       | `training-fixtures/fixed.js` uses a `$1` parameterized query instead of SQL string interpolation.                  | Implemented |
| CTRL-003 | Server-side input validation               | Malicious or malformed request input        | `AUTH001`                      | `training-fixtures/fixed.js` validates the request parameter before processing it.                                 | Implemented |
| CTRL-004 | Dangerous command/code execution detection | Command injection / code injection          | `EXEC001`                      | `training-fixtures/missed.js` demonstrates request-derived input reaching `exec()` and is detected by the scanner. | Implemented |
| CTRL-005 | JWT secret detection                       | JWT signing-key exposure                    | `JWT001`                       | `training-fixtures/jwt-weak.js` demonstrates literal JWT secret detection.                                         | Implemented |
| CTRL-006 | CI security gate                           | Vulnerable code reaching protected branches | GitHub Actions                 | `.github/workflows/security-scan.yml` executes the scanner and relies on its exit code.                            | Implemented |
| CTRL-007 | Scanner output retention                   | Loss of security evidence                   | GitHub Actions artifact upload | Workflow uploads scanner output using `if: always()`.                                                              | Implemented |
| CTRL-008 | Environment-based secret configuration     | Secret exposure in source code              | `SEC001` / `JWT001`            | `training-fixtures/fixed.js` obtains the JWT secret from `process.env.JWT_SECRET`.                                 | Implemented |

## Control Details

### CTRL-001 — Hardcoded Secret Detection

The scanner identifies potential hardcoded secrets and API keys.

A detected HIGH finding causes the scanner to return exit code `1`.

Evidence:

```text
artifacts/step9-vulnerable.txt
artifacts/step9-vulnerable-exit.txt
```

### CTRL-002 — Parameterized SQL

The vulnerable fixture constructs SQL using string interpolation.

The fixed fixture uses a parameterized query:

```javascript
const query = "SELECT id, name FROM products WHERE name LIKE $1";
const rows = await db.query(query, [`%${term}%`]);
```

This separates SQL structure from the supplied value.

Evidence:

```text
training-fixtures/vulnerable.js
training-fixtures/fixed.js
artifacts/step9-vulnerable.txt
artifacts/step9-fixed.txt
```

### CTRL-003 — Server-Side Validation

The fixed fixture checks that the request parameter exists and has the expected string type before further processing.

The input is also subject to a length restriction.

This demonstrates that validation is performed server-side rather than relying on client-side controls.

### CTRL-004 — Dangerous Execution Detection

The `EXEC001` rule was added after the original AI-generated scanner failed to produce a dedicated command/code-execution finding for the request-derived `exec()` pattern.

Evidence:

```text
training-fixtures/missed.js
scanner-review.md
```

### CTRL-005 — JWT Secret Detection

The `JWT001` rule identifies literal JWT signing secrets.

The rule was added because the original scanner did not provide a dedicated JWT-specific finding.

Evidence:

```text
training-fixtures/jwt-weak.js
scanner-review.md
```

### CTRL-006 — CI Security Gate

The workflow:

```text
.github/workflows/security-scan.yml
```

runs the scanner.

The scanner's actual exit code determines whether the security step passes or fails.

A HIGH finding produces exit code `1`.

### CTRL-007 — Evidence Retention

The workflow uploads:

```text
artifacts/medusa-ci-scan-findings.txt
```

as a GitHub Actions artifact.

The upload step uses `if: always()` so that scanner output remains available even when the security scan fails.

### CTRL-008 — Environment-Based Configuration

The fixed fixture uses:

```javascript
process.env.JWT_SECRET
```

rather than embedding a JWT signing secret directly in source code.

## Control Limitations

These controls are intentionally limited in scope.

The scanner is heuristic and pattern-based. It does not provide complete data-flow analysis and may produce false positives or false negatives.

The controls therefore supplement rather than replace:

* secure code review;
* dependency scanning;
* application security testing;
* secret scanning;
* penetration testing; and
* security architecture review.

## Overall Control Status

The controls required for the Week 5 security-gate demonstration are implemented and locally validated.

The GitHub Actions enforcement control requires the final GitHub repository and workflow execution evidence to complete the end-to-end demonstration.