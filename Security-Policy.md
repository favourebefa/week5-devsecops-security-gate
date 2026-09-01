# Security Policy

## 1. Purpose

This policy defines the security requirements for the Week 5 DevSecOps Security Gate.

The purpose of the security gate is to identify selected security-risk patterns before code is merged or deployed and to provide an automated mechanism for blocking code when HIGH-severity findings are detected.

The security process follows:

> **Detect → Fix → Verify → Enforce → Document**

## 2. Scope

This policy applies to the source code and security controls covered by the Week 5 assignment, including:

* the vulnerability scanner;
* JavaScript and TypeScript source-code analysis;
* intentionally vulnerable training fixtures;
* the GitHub Actions security workflow; and
* the documented security evidence associated with the scanner.

The training fixtures are for authorized security testing only and must not be deployed.

## 3. Security Requirements

The following security practices are required:

### 3.1 Secrets

Hardcoded secrets, API keys, passwords, tokens, private keys, and database credentials must not be committed to source code.

Secrets required by an application should be supplied through environment-based configuration or an approved secret-management system.

### 3.2 SQL Injection Prevention

User-controlled data must not be directly concatenated or interpolated into SQL statements.

Applications should use parameterized queries or an appropriate query-builder binding mechanism.

### 3.3 Server-Side Input Validation

Application input must be validated on the server before being used by security-sensitive operations.

Validation should check the expected type, format, length, and allowed values where appropriate.

Client-side validation must not be treated as a substitute for server-side validation.

### 3.4 Command and Code Execution

Request-controlled input must not be passed directly to dangerous command or code-execution functions such as `exec()` or `eval()`.

Where command execution is genuinely required, the implementation should use safe APIs, strict allow-lists, and controlled arguments rather than relying primarily on filtering user input.

### 3.5 JWT Secret Management

JWT signing secrets must not be hardcoded in application source code.

JWT implementations should also be reviewed for:

* approved signing algorithms;
* appropriate expiration;
* issuer validation;
* audience validation; and
* secure key management.

## 4. Security Gate

The vulnerability scanner assigns HIGH severity to the security patterns covered by the current rules.

The expected gate behavior is:

```text
HIGH finding
    ↓
Scanner exit code 1
    ↓
GitHub Actions security job fails
```

When no applicable findings are detected:

```text
No HIGH findings
    ↓
Scanner exit code 0
    ↓
Security job can pass
```

The workflow must use the scanner's actual exit code rather than artificially forcing a failure.

## 5. Security Review

Scanner findings are security-review indicators and are not automatically proof of exploitability.

Each finding should be reviewed to determine whether:

1. the pattern represents a genuine security issue;
2. the finding is a false positive;
3. the underlying code should be changed; or
4. additional testing is required.

A finding must not be considered resolved merely by suppressing the scanner output.

## 6. Secret Protection

The repository must not contain:

* `.env` files containing real secrets;
* production passwords;
* live API keys;
* private keys;
* live access tokens;
* database credentials; or
* other confidential authentication material.

The training fixtures may contain intentionally fake secret-like values solely for demonstrating scanner detection.

## 7. Continuous Integration

The GitHub Actions workflow is intended to run on:

* pushes to `main`; and
* pull requests targeting `main`.

The security scanner is executed as part of the workflow. A HIGH finding should cause the scanner to return a non-zero exit code and consequently fail the security-check step.

Scanner output should remain available as a workflow artifact, including when the scanner fails.

## 8. Exceptions

A security finding may be documented as a justified false positive when review demonstrates that the reported pattern does not represent a security weakness.

The exception should document:

* the finding;
* the reason it is considered a false positive;
* the relevant code or control;
* the reviewer; and
* any compensating control where applicable.

## 9. Limitations

The scanner uses pattern matching and heuristic analysis. It is not a replacement for:

* full static analysis;
* dependency vulnerability scanning;
* dynamic application testing;
* penetration testing;
* secret-history scanning;
* code review; or
* security architecture review.

A clean scanner result therefore does not prove that an application is secure.

## 10. Policy Objective

The objective of this policy is to ensure that security issues identified by the configured scanner are detected early, remediated appropriately, verified locally, and enforced through the CI security gate before deployment.