## WorkflowForge Roadmap

A phased plan to evolve WorkflowForge into a world-class product for generating, validating, editing, and operating n8n workflows from natural language.

### Phase 0 - Foundation & Quality (MVP)
- Baseline UX
  - [x] Clear primary CTA (Generate). Keyboard: Ctrl/Command+Enter.
  - [x] Example prompts and empty states
  - [x] Non-blocking toasts
- Robust JSON validity
  - [x] Client-side schema validation with Zod
  - [x] Server-side schema validation with Zod
  - [ ] JSON repair path when LLM returns near-valid JSON; actionable error messages.
- Safety & privacy
  - [x] Replace secrets with {{CRED:*}} placeholders (server & client checks).
  - [x] Opt-in local persistence for sensitive values (Remember API Key toggle).
- n8n import basics
  - [x] Create new workflow via API; strip helper fields.
  - [ ] Return deep link to open workflow in n8n. (De-scoped: copy JSON to clipboard only)
- Dev observability
  - [ ] Standardized error envelopes (code, message, hint).
  - [ ] Basic request/response logging with PII redaction.

### Phase 1 - Prompting & Guidance (MVP -> V1)
- Guided prompting
  - [ ] Prompt builder: Trigger + Sources + Transforms + Outputs chips.
  - [ ] Inline hints aligned with n8n node capabilities.
- Prompt memory
  - [ ] Recent prompts and saved snippets.
- Model controls
  - [x] Provider selection (OpenAI, Claude)
  - [ ] Local provider support
  - [ ] Temperature and max tokens options.
- Context injection
  - [ ] Optional RAG: include in-app docs and n8n node catalogue context.

### Phase 2 - Generation Engine Hardening (V1)
- Deterministic output where possible
  - [ ] Use JSON mode/function-calling where available. Seeded retries.
- Self-repair and fallback
  - [ ] Automatic parse-repair cycle; provider fallback chain (primary -> secondary -> local).
  - [ ] Clear UX to show which path succeeded.
- Domain constraints
  - [ ] Enforce node count limit, require trigger presence, ensure connections are acyclic.
  - [ ] Substitute unsupported integrations with httpRequest + note in __notes.

### Phase 3 - Validation, Lint & Safety (V1)
- Schema validation (server authoritative)
  - [ ] Reject invalid structure; return actionable errors with paths.
- Workflow linter
  - [ ] Rules: missing credentials, unreachable nodes, orphan outputs, weak naming, unsafe patterns.
  - [ ] Severity levels (error/warn/info) reported inline.
- Credential placeholder management
  - [x] Extract placeholders
  - [ ] Forbid hard-coded secrets (reject invalid inputs)
  - [ ] Suggest mapping names.
- Security scans
  - [x] Detect API keys/tokens; auto-redact in preview.

### Phase 4 - Visualization & Editing (V1)
- Visual DAG preview
  - React Flow-based viewer: zoom, pan, fit-to-screen.
  - Node metadata popovers (type, credentials, parameters).
- Lightweight editing
  - Rename nodes; edit common parameters for popular node types.
  - Re-layout graph and export updated JSON.
- Diff & versioning
  - Show diffs between generations; undo/redo; save versions to local history.

### Phase 5 - Credential Experience (V1)
- Pull credentials from n8n
  - Use n8n API to list available credentials per type; searchable dropdowns.
- Mapping intelligence
  - Suggest mappings based on placeholder name/type.
- Environments
  - Separate dev/prod credential sets; quick switch with validation.

### Phase 6 - Export, Test & Execution (V1 -> V2)
- Export modes
  - Copy JSON to clipboard [x]
  - Download JSON file [x]
  - (De-scoped) Import to n8n directly
- Test flows
  - Webhook tester: generate curl; receive & preview payloads.
  - Partial run from node X to Y; show sample outputs.
- Execution insights
  - Pull execution logs for recent runs; summarize failures; deep link to n8n execution.

### Phase 7 - Templates, Library & Sharing (V2)
- Template gallery
  - Curated templates (Email summary, CRM sync, Slack alerts, RAG workflows).
  - Tags, search, ratings, last updated.
- User library
  - Save, duplicate, rename; export/import JSON; shareable links (private/public).
- Inline education
  - Explain this workflow and Why these nodes panels.

### Phase 8 - Collaboration (V2)
- Comments & annotations
  - Per-node notes; mentions.
- Roles & permissions
  - Owners, editors, viewers per workspace/project.
- Change reviews
  - Propose changes, request review, accept/merge into workspace.

### Phase 9 - Analytics & Cost Controls (V2)
- LLM cost dashboard
  - Tokens & cost by provider, prompt, user, period.
- Quality metrics
  - Valid-on-first-try rate, repair rate, import success rate, test pass rate.
- Recommendations
  - Suggest smaller/faster models when quality allows.

### Phase 10 - Performance & Reliability (V2)
- Caching & deduplication
  - Cache identical prompts+options; fingerprint to avoid duplicates.
- Rate limiting & backpressure
  - Per user/workspace, friendly errors with retry-after.
- Durable jobs
  - Queue long-running tasks; resumable operations; idempotent endpoints.

### Phase 11 - Security, Privacy & Compliance (V2+)
- Enterprise security
  - SSO (SAML/OIDC), enforced MFA, SCIM.
- Data controls
  - Region pinning; data retention policies; export/delete on request.
- Compliance
  - SOC 2 controls readiness, penetration tests, vendor risk docs.

### Phase 12 - Enterprise n8n Integrations (V2+)
- Multi-environment targeting
  - Dev/Staging/Prod endpoints with synced credential mapping profiles.
- Drift detection
  - Detect divergence between local workflow and live n8n; suggest sync.
- Governance
  - Approval workflows; change tickets; audit trails tied to imports/tests.

### Phase 13 - Extensibility & Ecosystem (V2+)
- Plugin system
  - Pre/post-processors for generation; custom linters; organization policies.
- CLI & CI
  - CLI to validate, lint, diff, import; CI integration (PR checks).
- API/SDK
  - Public API to generate/validate/import; TypeScript SDK.

### Phase 14 - Monetization & Packaging (V2+)
- Plans & quotas
  - Free (local only), Pro (cloud LLMs), Team (collab), Enterprise (SSO, audit).
- Billing
  - Usage-based with limits; alerts; overage protection.
- Deployment
  - Cloud hosted and self-host (Docker/Helm) with feature flag parity.

---

## Functional Requirements (by area)

### Prompting & Generation
- Compose prompts via chips and free text; select model/provider.
- Generate valid n8n JSON conforming to schema within target latency (e.g., P95 <= 10s).
- On invalid JSON, attempt automatic repair and/or fallback to secondary provider.
- Annotate outputs with __preview, __testPayload, and __notes.

### Validation & Safety
- Client and server validate against shared schema.
- Linter surfaces errors/warnings with node references and human-readable fixes.
- No secrets in output; all credentials are placeholders or mapped values.

### Visualization & Editing
- Users can view DAG and inspect nodes.
- Users can edit core fields for common nodes and re-export JSON.
- Users can compare generations with a diff view and revert.

### Credentials & Import
- Users fetch credentials from n8n, search, and map placeholders.
- Users select environment (dev/prod) mappings.
- Users create new or update existing workflows in n8n with a dry-run diff.

### Testing & Execution
- Users simulate webhook payloads and partial runs.
- The system retrieves and displays execution logs, highlighting failures.

### Collaboration & Templates
- Users save, share, and import/export workflows; control visibility.
- Templates are versioned; show last tested date; allow ratings.

### Analytics & Reliability
- Track generation attempts, success/repair rates, import/test outcomes.
- Impose rate limits and backoff on upstream failures.

### Security & Compliance
- Secrets encrypted at rest; audit logs for sensitive operations.
- Provide data export/delete and configurable retention policies.

---

## Milestone Checklist (condensed)
- [ ] MVP: Prompt basics, JSON validation, placeholder safety, n8n import, basic toasts.
  - [x] Prompt basics
  - [x] Placeholder safety
  - [x] n8n import
  - [x] Basic toasts
  - [x] Client JSON validation
  - [ ] Server JSON validation
  - [ ] JSON repair path
- [ ] V1: Guided prompting, self-repair/fallback, DAG preview, linting, credential autocomplete, test & partial runs.
- [ ] V2: Templates, collaboration, analytics, durable jobs, rate limits, enterprise security, CI/CLI.
- [ ] V2+: Ecosystem plugins, API/SDK, enterprise governance, monetization, self-host.

---

## Non-Goals (for now)
- Full n8n parity editor (assist and accelerate, not replicate entire studio).
- Long-running in-app executions (delegate to n8n; we orchestrate and analyse).

---

## Success Metrics
- >= 90% first-try valid JSON for top 10 use cases.
- <= 10s P95 generation latency (cached <= 1s).
- >= 95% import success rate; >= 80% credential mappings auto-suggested correctly.
- >= 50% users use a template or saved snippet in week 1.
