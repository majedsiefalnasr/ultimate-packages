# Security Policy

## Supported Versions

This project is pre-`1.0.0`. All packages in the Ultimate Platform are at version `0.1.0`. There is no formal support-window or long-term-support policy at this stage.

## Reporting a Vulnerability

If you believe you have found a security vulnerability, please report it using GitHub's private Security Advisory mechanism. Navigate to:

```
https://github.com/<owner>/<repo>/security/advisories/new
```

Replace `<owner>/<repo>` with your repository's path. Private Security Advisories allow you to report the vulnerability confidentially, and they facilitate coordinated disclosure before any public announcement.

## What Is in Scope

Security reports are accepted for vulnerabilities in:

- **Package source code**: The `@ultimate/*` package implementations under `packages/*/src/`
- **CI/build tooling**: Build and validation scripts under `scripts/`
- **CI pipeline**: GitHub Actions workflows under `.github/workflows/`

## Automated Detection vs. Disclosure vs. Duplicate Handling

### Automated Detection Is Preventive Scanning, Not a Disclosure Channel

The Ultimate Platform runs several automated security gates during CI:

- **Dependency scanning** (`audit:validate`)
- **License compliance** (`license:validate`)
- **Static analysis** (`sast:validate`)
- **Install-script policy** (`install-script-policy:validate`)

These gates detect certain classes of issues and may fail the build. However, automated detection is a **preventive measure**, not a disclosure or reporting channel. A gate catching an issue does not constitute acknowledgment or tracking of that vulnerability as a reported security incident.

### Disclosure Remains Open to Any Suspected Vulnerability

Anyone may report a suspected vulnerability through the GitHub private Security Advisory mechanism **regardless of whether an automated gate also detects it**. There is no class of vulnerability that is categorized as "out of scope" or "not reportable" because a CI gate scans for it. If you suspect a security issue, please report it.

### Duplicate Reports Are Acknowledged and Linked, Not Dismissed

If a vulnerability report matches a finding already documented (for example, in `docs/architecture/SAST_BASELINE.md`'s grandfathered baseline table), the report is acknowledged as a valid received report. It is linked to the existing tracked finding, but it is never dismissed as "not a report" or treated as non-reportable. Every report received through the private Security Advisory mechanism is treated as a valid submission.

## Relationship to Dependency Scanning

The `audit:validate` script runs `pnpm audit --audit-level high --prod` to scan production dependencies for known high-severity vulnerabilities. This scanning is run as part of the CI gate and helps detect issues in the supply chain. However, as noted above, this is preventive detection, not a disclosure mechanism.

## Relationship to License Scanning

The `license:validate` script runs `license-checker-rseidelsohn` to verify that all dependencies use approved licenses (MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, CC0-1.0). License compliance is tracked as part of the broader quality gates (Blueprint §29) but is not itself a vulnerability-reporting mechanism.

## Relationship to SAST and CodeQL

The `sast:validate` script validates the Static Application Security Testing baseline using CodeQL's `security-extended` query suite, configured in `.github/codeql/codeql-config.yml`. This automated analysis runs on all code within the declared scope (packages and scripts) and helps detect certain classes of security findings early.

For details on how findings are triaged, grandfathered, and tracked, see `docs/architecture/SAST_BASELINE.md`.

## Relationship to the Malicious Install-Script Policy

The `install-script-policy:validate` script (`scripts/provenance/validate-install-script-policy.mjs`) enforces a policy that prevents the execution of untrusted npm/pnpm install scripts during the dependency installation process. This is a preventive control that reduces the risk of supply-chain attacks at install time.

## Patch and Advisory Process

There is no automated advisory-publication mechanism. When a confirmed vulnerability is identified:

1. A patch is prepared and submitted as a normal pull request through the repository.
2. The patch must pass all CI gates, including the security gates mentioned above.
3. Once merged, the fix is noted in the project's change history (CHANGELOG.md once release automation is in place, or in PR and commit history until then).
4. Users are expected to update to the patched version when it is available.

There is no guaranteed response time, SLA, or formal coordination process beyond these steps.
