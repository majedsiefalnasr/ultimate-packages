# Ultimate Platform Blueprint

**Document:** `ULTIMATE_PLATFORM_BLUEPRINT.md`  
**Version:** 0.1  
**Status:** Architecture Baseline  
**Language:** English  
**Audience:** Platform architects, framework engineers, design-system engineers, developer-experience engineers, AI/tooling engineers, Codex/Superpowers agents

---

## 1. Purpose

Ultimate is a company-owned, multi-framework UI platform derived from selected MIT-licensed Prime ecosystem source baselines.

Ultimate is not intended to remain a branded or lightly modified fork of Prime. Prime is the historical technical foundation and reference implementation. Ultimate owns the resulting source, public API, package architecture, roadmap, maintenance, tooling, metadata, and AI integration.

The initial target frameworks are:

- Angular
- React
- Vue

The architecture must remain extensible to additional frameworks in the future.

This document is the architectural baseline for implementation. Implementation work must follow the Superpowers workflow:

1. Specification
2. Implementation Plan
3. Implementation
4. Verification

Architectural deviations require explicit review.

---

## 2. Core Architectural Principles

### 2.1 Ownership

Ultimate must ultimately own the runtime implementation of its UI framework packages.

There must be no required runtime dependency on PrimeNG, PrimeVue, PrimeReact, or current PrimeUIX packages.

### 2.2 Prime as a Source Baseline

Prime source is used as a proven implementation baseline and architectural reference.

Ultimate must not blindly preserve Prime architecture, naming, APIs, branding, or dependency structure.

### 2.3 MIT-only Provenance

Only source revisions whose applicable license permits the intended Ultimate use may be incorporated.

The initial provenance process must record:

- repository
- exact revision/commit
- package
- license
- copyright notices
- included third-party code
- dependency
- license compatibility
- required attribution
- modifications made by Ultimate

LTS/commercial-only source must not be incorporated unless independently verified as legally permissible.

### 2.4 Framework-Native Implementations

Angular, React, and Vue implementations remain native to their respective frameworks.

Ultimate should share contracts, metadata, concepts, and framework-neutral infrastructure where practical, but must not force a single rendering implementation across frameworks.

### 2.5 Independent Themes

Themes/presets are a separate layer from component implementations.

A design language may be distributed as an Ultimate theme/preset without becoming part of the framework runtime.

### 2.6 Tooling Is Separate from Runtime

CLI, MCP, AI, Skills, documentation generators, and metadata tooling must not become runtime dependencies of application components.

### 2.7 Machine-Readable Component Knowledge

Component metadata is a first-class platform artifact.

Documentation, CLI tooling, MCP, Skills, and LLM-oriented outputs should consume the same canonical component knowledge model.

### 2.8 Minimal Reinvention

Ultimate should reuse mature Prime implementation patterns where they are technically sound rather than rewriting proven component behavior without a reason.

---

## 3. Strategic Position

Ultimate consists of three cooperating platform areas:

```text
Ultimate Platform
├── UI Platform
├── Developer Platform
└── AI Platform
```

### UI Platform

```text
UltimateUIX
├── shared utilities
├── styling infrastructure
├── styles
├── motion
└── shared contracts/primitives where appropriate

UltimateNG
UltimateReact
UltimateVue
```

### Developer Platform

```text
Ultimate CLI
├── project creation
├── framework integration
├── package installation
├── theme configuration
├── generators
├── diagnostics
├── migrations
└── compatibility resolution
```

### AI Platform

```text
Ultimate Metadata
        ↓
Ultimate MCP
Ultimate Skills
LLM-oriented documentation/context
AI agent integration
```

---

## 4. Repository Strategy

### Decision

Use one monorepo for the Ultimate ecosystem.

The monorepo is the source of truth for platform source, shared infrastructure, framework packages, themes, metadata, tooling, documentation, tests, and release configuration.

Packages remain independently publishable.

### Proposed Repository Shape

```text
ultimate/
├── packages/
│   ├── uix/
│   ├── uix-utils/
│   ├── uix-styled/
│   ├── uix-styles/
│   ├── uix-motion/
│   │
│   ├── ng-core/
│   ├── ng/
│   │
│   ├── react-core/
│   ├── react/
│   │
│   ├── vue-core/
│   ├── vue/
│   │
│   ├── themes/
│   │
│   ├── component-schema/
│   ├── component-metadata/
│   │
│   ├── cli/
│   ├── mcp/
│   └── ai/
│
├── apps/
│   ├── docs/
│   ├── showcase/
│   ├── playground-angular/
│   ├── playground-react/
│   └── playground-vue/
│
├── skills/
├── tooling/
├── scripts/
├── docs/
│   └── architecture/
│
├── .changeset/
└── ...
```

Names are provisional and must not be treated as final until Phase 0 validates package boundaries.

---

## 5. Package Boundary Rules

### Shared UIX Packages

Candidate responsibilities:

- utilities
- styling runtime
- style resolution
- motion
- shared theme infrastructure
- framework-neutral primitives only where proven useful

These packages must not contain framework-specific rendering logic.

### Framework Core Packages

Candidate responsibilities:

- base component behavior
- framework lifecycle integration
- framework-native event/input mechanisms
- framework-specific accessibility/runtime helpers
- framework-specific rendering abstractions

### Framework Component Packages

Responsibilities:

- actual Angular components
- actual React components
- actual Vue components
- public framework APIs
- component-specific implementation
- framework-specific tests

### Theme Packages

Responsibilities:

- tokens
- semantic values
- component styling configuration
- variants
- light/dark modes
- design-language presets

Themes must not require a specific framework implementation when the underlying theme contract is framework-neutral.

### Metadata Packages

Responsibilities:

- schema
- component metadata
- API information
- framework mappings
- accessibility metadata
- examples
- relationships
- migration information

### CLI

Responsibilities:

- orchestration
- project initialization
- framework integration
- dependency installation
- compatibility resolution
- generators
- diagnostics
- migrations
- optional AI setup

The CLI must not replace Angular CLI, Vite, or equivalent official framework tooling.

### MCP

Responsibilities:

- expose Ultimate knowledge and tooling through MCP
- component discovery
- API lookup
- documentation retrieval
- examples
- project-aware guidance
- migration assistance
- framework-aware queries

MCP must remain optional and must never be a runtime dependency.

### AI Package

Responsibilities:

- AI-oriented context generation
- Skills packaging
- LLM context generation
- agent metadata
- AI compatibility rules

---

## 6. Dependency Direction

Runtime dependency direction:

```text
Framework Components
        ↓
Framework Core
        ↓
UltimateUIX
```

Theme direction:

```text
Theme / Preset
        ↓
Ultimate styling/theme contracts
        ↓
Framework implementations
```

AI/tooling direction:

```text
Component Source
      +
Component Metadata
      +
Documentation
      ↓
CLI / MCP / AI / Skills / LLM outputs
```

Prohibited direction:

```text
Ultimate Components
        ↓
CLI
        ↓
MCP
        ↓
AI
```

AI and developer tooling must consume platform knowledge; runtime components must not depend on those tools.

---

## 7. Prime Baselines

Initial candidates identified during architecture research:

### Angular

PrimeNG `21.1.9` is the initial baseline candidate.

### Vue

PrimeVue `4.5.5` is the initial stable baseline candidate.

### React

PrimeReact `10.9.8` is the stable implementation baseline candidate.

PrimeReact 11 alpha should be evaluated as an architectural reference because its package decomposition is closer to the desired Ultimate structure.

### PrimeUIX

Do not depend on current PrimeUIX npm packages by default.

Identify exact historical MIT revisions corresponding to the selected framework baselines and verify their licenses and dependency relationships.

### Baseline Rule

Before implementation begins, Phase 0 must pin exact commits/tags and produce provenance records.

No implementation phase may silently change a baseline.

---

## 8. Provenance and Licensing

Phase 0 must create a provenance inventory covering:

```text
Source Repository
Commit / Tag
Package
License
Copyright
Third-party code
Runtime dependency
Build dependency
Attribution requirement
Modification status
Ultimate package destination
```

Every copied or materially derived source area must be traceable.

Ultimate must preserve legally required copyright and license notices.

Current Prime packages must not be assumed to have the same licensing terms as historical MIT baselines.

The implementation must distinguish:

- historical MIT community source
- commercial/LTS source
- current PrimeUI-licensed packages
- unrelated third-party dependencies

Legal review is required before external distribution if company policy requires it.

---

## 9. Framework Strategy

Ultimate targets:

```text
UltimateNG
UltimateReact
UltimateVue
```

Each implementation is framework-native.

Shared architecture should focus on:

- component semantics
- public intent
- design tokens
- metadata
- accessibility requirements
- behavior contracts
- state models
- documentation concepts
- examples
- testing expectations

Do not force identical APIs where framework conventions make that harmful.

API consistency is desirable, but native developer experience has priority.

---

## 10. Public API Strategy

Ultimate should not permanently bind itself to Prime APIs.

Initial migration should preserve Prime-compatible behavior where doing so significantly reduces risk.

However, the long-term goal is an Ultimate-owned API.

API decisions should distinguish:

```text
Compatibility
vs.
Ownership
vs.
Framework idioms
```

Renaming selectors from `p-*` to `u-*` or another prefix is not itself an architectural objective.

Ownership and independent evolution are the objectives.

Public naming must be decided before the first stable public release.

---

## 11. Component Ownership Strategy

Ultimate owns:

- component source
- component behavior
- public API
- tests
- accessibility behavior
- performance behavior
- browser compatibility
- framework compatibility
- security fixes
- future feature roadmap

Prime becomes a historical/reference source.

Security advisories affecting the historical Prime baseline must be tracked and evaluated, but Ultimate does not require continuous upstream merging.

---

## 12. Upstream Strategy

Do not implement continuous Prime synchronization.

Use:

```text
Prime baseline
     ↓
Ultimate ownership
     ↓
Independent evolution
```

For security:

```text
Prime security advisory
        ↓
Ultimate security review
        ↓
Patch / reject / document
```

For general Prime feature development:

```text
Prime roadmap
     ↓
No automatic dependency
```

Ultimate chooses features based on its own roadmap.

---

## 13. Angular Compatibility Strategy

PrimeNG's final OSS baseline does not eliminate framework maintenance.

UltimateNG must independently track:

- supported Angular versions
- TypeScript compatibility
- compiler behavior
- SSR
- hydration
- signals
- forms
- Angular CDK
- build tooling
- browser compatibility

Angular compatibility is an Ultimate responsibility.

---

## 14. React and Vue Compatibility Strategy

UltimateReact and UltimateVue must independently track:

- supported React/Vue versions
- TypeScript
- bundler behavior
- SSR
- hydration
- ecosystem compatibility
- framework-specific accessibility/runtime changes

Shared component semantics must not prevent framework-native implementation.

---

## 15. Theme Architecture

Themes are independent presets.

Conceptually:

```text
Ultimate Theme Contract
        │
 ┌──────┼──────┐
 ↓      ↓      ↓
Angular React  Vue
```

A theme may define:

- primitive tokens
- semantic tokens
- component tokens
- states
- variants
- light/dark modes
- density
- motion preferences
- direction-aware values

Themes must not require application-specific business logic.

---

## 16. Design System Position

Ultimate does not require one mandatory corporate Design System.

The platform provides the infrastructure for multiple themes/presets.

A corporate design language can later be implemented as an Ultimate preset.

This keeps the UI framework reusable across unrelated projects.

---

## 17. Component Metadata

Component metadata is a first-class artifact.

Candidate information:

```text
Component
├── identity
├── description
├── framework availability
├── API
├── props / inputs
├── events / outputs
├── slots / templates
├── states
├── variants
├── tokens
├── accessibility
├── examples
├── relationships
├── migration
└── AI guidance
```

Metadata must be versioned.

The schema itself must have an explicit version.

---

## 18. Component Knowledge Model

The preferred model is:

```text
Component Source
      +
Metadata
      +
Human-authored guidance
      ↓
Ultimate Knowledge Model
      │
 ┌────┼────────┬────────┐
 ↓    ↓        ↓        ↓
Docs  Storybook MCP    Skills
                 ↓
              LLM context
```

Facts should be generated from authoritative source/metadata where possible.

Human-authored guidance should capture intent, recommendations, anti-patterns, and decision rules.

---

## 19. CLI Architecture

`@ultimate/cli` is an orchestrator.

Conceptual commands:

```text
ultimate create
ultimate init
ultimate add
ultimate generate
ultimate theme
ultimate doctor
ultimate update
ultimate migrate
ultimate ai
```

Exact command names are not final.

The CLI must:

- detect/select framework
- invoke official framework tooling
- install compatible Ultimate packages
- resolve theme
- configure optional capabilities
- validate compatibility
- generate code/configuration
- diagnose project state

The CLI should support common package managers where practical.

It must not become a replacement for official framework build systems.

---

## 20. Compatibility Resolver

Ultimate should maintain a compatibility model connecting:

```text
Framework version
Ultimate framework package
UltimateUIX version
Theme version
Metadata schema
CLI version
MCP version
AI/Skills version
```

A compatibility manifest should be machine-readable.

The CLI should use it to prevent incompatible combinations.

---

## 21. Versioning

Use independent package versioning.

Do not require every package to share a version number.

Example:

```text
@ultimate/uix             1.x
@ultimate/ng              1.x
@ultimate/react           1.x
@ultimate/vue             1.x
@ultimate/theme-*         1.x
@ultimate/component-schema 1.x
@ultimate/mcp             1.x
@ultimate/cli             1.x
```

A compatibility matrix provides the platform-level relationship.

Use Changesets or an equivalent proven monorepo release mechanism.

---

## 22. AI Platform

AI integration consists of:

```text
Ultimate Metadata
        │
 ┌──────┼─────────┐
 ↓      ↓         ↓
MCP   Skills   LLM context
```

AI tooling must support multiple agents and providers.

Ultimate must not depend on a specific model vendor.

---

## 23. MCP Architecture

`@ultimate/mcp` is a separate package.

Potential capabilities:

- component search
- API lookup
- usage examples
- accessibility guidance
- theme/token lookup
- migration assistance
- framework-aware recommendations
- project-aware information
- CLI/tooling discovery

MCP should read structured Ultimate metadata rather than depend on arbitrary source parsing at runtime.

---

## 24. Skills Architecture

Skills are operational AI guidance, not merely documentation.

A skill may contain:

```text
When to use
Preferred patterns
Allowed/recommended APIs
Anti-patterns
Accessibility guidance
Examples
Related components
Framework-specific guidance
```

Skills should be versioned and tied to compatible Ultimate metadata/component versions.

Skills may be human-authored but should reference canonical component metadata.

---

## 25. LLM-Oriented Documentation

Ultimate should provide generated LLM-friendly documentation/context.

Potential outputs:

```text
llms.txt
llms-full.txt
structured component context
framework-specific context
project context
```

These should be generated from:

- component metadata
- API information
- documentation
- examples
- human-authored AI guidance

Generated outputs should not become the primary source of truth.

---

## 26. AI Context Layers

AI knowledge should distinguish:

```text
Platform Knowledge
Framework Knowledge
Component Knowledge
Theme Knowledge
Project Knowledge
Task Knowledge
```

Project-level instruction files may customize how Ultimate is used without changing Ultimate itself.

The platform should provide conventions for agent instruction files and Skills, while avoiding dependence on one specific coding agent.

---

## 27. Storybook and Documentation

Storybook is a platform documentation/testing surface, not a separate design system.

It should expose the Ultimate component experience consistently across frameworks where practical.

Documentation should combine:

- component API
- behavior
- usage
- accessibility
- theming
- examples
- framework-specific notes
- AI guidance where useful

Generated API documentation and authored guidance should be composable.

---

## 28. Testing Strategy

Testing must exist at multiple levels.

### Unit

- utilities
- core behavior
- state models
- metadata generation

### Component

- rendering
- API
- events
- states
- accessibility
- keyboard behavior
- styling

### Integration

- themes
- overlays
- forms
- data components
- framework integration

### Cross-framework Contract Tests

Where meaningful, shared component contracts should have equivalent test expectations across Angular, React, and Vue.

### Visual Regression

Use stable theme/component combinations.

### Accessibility

Automated checks plus targeted keyboard/screen-reader behavior tests.

### Build/Package

Verify:

- tree-shaking
- package exports
- ESM
- SSR where supported
- bundle boundaries
- absence of unwanted AI/tooling runtime dependencies

---

## 29. Security Strategy

Ultimate becomes responsible for runtime security.

Security process must include:

- dependency scanning
- license scanning
- SAST where appropriate
- vulnerability monitoring
- security advisories
- patch releases
- provenance tracking
- malicious package/dependency review

Prime security advisories are inputs, not automatic patches.

---

## 30. Accessibility Strategy

Accessibility must be treated as a platform responsibility.

Each component must define expected:

- semantic structure
- keyboard interaction
- focus management
- ARIA behavior
- screen-reader behavior
- disabled/loading states
- high-contrast considerations where relevant
- RTL behavior

Accessibility regressions are release blockers for affected components.

---

## 31. Performance Strategy

Ultimate must preserve proven Prime performance characteristics while establishing explicit budgets.

Measure:

- bundle size
- component cost
- rendering cost
- change/update cost
- virtual scrolling performance
- overlay performance
- SSR/hydration behavior
- tree-shaking

Do not optimize based on assumptions; establish benchmarks.

---

## 32. Data Components

Data components are high-value but high-complexity.

Shared architecture may define:

- selection semantics
- sorting model
- filtering model
- pagination model
- editing model
- grouping
- expansion
- virtualization contract
- accessibility requirements

Actual rendering remains framework-specific.

Data components should not be rewritten merely to make the code look uniform across frameworks.

---

## 33. Icons

Icons are a separate concern from the core UI framework.

Ultimate should define an icon contract and allow:

- Ultimate icon package
- external icon packages
- project-specific icons

Icon licensing/provenance must be independently verified.

---

## 34. Package Naming

Names are provisional.

Potential naming pattern:

```text
@ultimate/uix-*
@ultimate/ng
@ultimate/react
@ultimate/vue
@ultimate/theme-*
@ultimate/component-schema
@ultimate/component-metadata
@ultimate/cli
@ultimate/mcp
@ultimate/ai
```

Final names must be validated for npm availability, internal conventions, scope ownership, and long-term clarity.

---

## 35. Phase Roadmap

### Phase 0 — Baseline, Provenance, and Repository Foundation

Objectives:

- establish monorepo
- pin exact source baselines
- verify licenses
- inventory dependencies
- record provenance
- establish build/release tooling
- establish architecture documentation
- establish no-Prime-runtime-dependency rule

Exit criteria:

- reproducible baseline
- provenance complete
- license inventory complete
- dependency graph documented
- repository structure established
- CI foundation established

---

### Phase 1 — UltimateUIX Foundation

Objectives:

- extract/adapt shared infrastructure
- remove unnecessary Prime coupling
- establish Ultimate naming boundaries
- establish theme/styling contracts
- establish shared utilities

Exit criteria:

- UIX packages build independently
- no prohibited Prime runtime dependency
- tests pass
- package exports are stable enough for framework work

---

### Phase 2 — UltimateNG

Objectives:

- establish Angular core
- migrate/adapt component implementations
- preserve behavior
- establish Ultimate API boundary
- validate Angular compatibility

Exit criteria:

- target component set builds
- component tests pass
- accessibility baseline passes
- visual baseline established
- package consumers can use UltimateNG without installing PrimeNG

---

### Phase 3 — UltimateReact

Objectives:

- establish React core
- migrate/adapt component implementations
- apply Ultimate shared contracts
- preserve React-native ergonomics

Use PrimeReact 10 stable implementation as a reference and PrimeReact 11 architecture as an additional reference.

---

### Phase 4 — UltimateVue

Objectives:

- establish Vue core
- migrate/adapt component implementations
- apply shared contracts
- preserve Vue-native ergonomics

---

### Phase 5 — Themes

Objectives:

- establish theme contract
- port/create baseline presets
- support light/dark
- support direction-aware behavior
- validate cross-framework theme consistency

---

### Phase 6 — Component Metadata

Objectives:

- establish schema
- generate/author component metadata
- connect metadata to components
- validate metadata during CI

---

### Phase 7 — CLI

Objectives:

- create project orchestration
- framework adapters
- dependency resolution
- theme setup
- generators
- diagnostics
- migration foundations

---

### Phase 8 — MCP

Objectives:

- expose metadata/docs/examples
- framework-aware queries
- project-aware queries
- AI-friendly component discovery

---

### Phase 9 — AI Skills and LLM Context

Objectives:

- Skills architecture
- generated LLM context
- agent instruction conventions
- compatibility between Skills and metadata
- AI validation workflows

---

### Phase 10 — Production Hardening

Objectives:

- security
- accessibility
- performance
- browser compatibility
- SSR/hydration
- package quality
- release automation
- migration tooling
- operational documentation

---

## 36. Superpowers Workflow

Every implementation phase must use:

```text
Phase
  ↓
Spec
  ↓
Review
  ↓
Implementation Plan
  ↓
Implementation
  ↓
Verification
  ↓
Phase Exit Review
```

The specification must reference this blueprint.

The implementation plan must not silently redefine architecture.

Implementation should be incremental and verifiable.

---

## 37. Architectural Deviation Protocol

If implementation discovers a conflict with the blueprint:

Do not silently change the architecture.

Produce:

```text
Finding
Impact
Current constraint
Options
Recommendation
Trade-offs
Required decision
```

Then update the architecture decision record after approval.

---

## 38. Architecture Decision Records

Maintain:

```text
docs/architecture/DECISIONS.md
```

Initial ADR candidates:

```text
ADR-001  Ultimate is a company-owned platform
ADR-002  Monorepo architecture
ADR-003  Independent package versioning
ADR-004  No Prime runtime dependency
ADR-005  MIT baseline/provenance strategy
ADR-006  Framework-native implementations
ADR-007  Independent theme layer
ADR-008  CLI as orchestrator
ADR-009  Component metadata as source-of-truth
ADR-010  MCP as optional tooling
ADR-011  Skills as AI-operational knowledge
ADR-012  LLM context generated from platform knowledge
ADR-013  Security tracking without continuous Prime sync
```

---

## 39. Documentation Artifacts

Recommended architecture documentation:

```text
docs/architecture/
├── BLUEPRINT.md
├── DECISIONS.md
├── PROVENANCE.md
├── DEPENDENCIES.md
├── COMPATIBILITY.md
├── PACKAGE_ARCHITECTURE.md
├── AI_ARCHITECTURE.md
└── ROADMAP.md
```

`BLUEPRINT.md` is the baseline.

`DECISIONS.md` records approved changes.

`PROVENANCE.md` records source lineage.

`DEPENDENCIES.md` records runtime/build dependencies.

`COMPATIBILITY.md` records supported framework/package combinations.

---

## 40. Definition of Done for the Platform

Ultimate is not considered production-ready merely because the components compile.

Production readiness requires:

- verified licensing/provenance
- no prohibited Prime runtime dependencies
- stable package boundaries
- supported framework versions
- accessibility validation
- security process
- performance benchmarks
- visual regression coverage
- documented APIs
- metadata coverage
- compatibility resolver
- release automation
- migration strategy
- CLI quality
- AI/MCP quality where those phases are enabled

---

## 41. Explicit Non-Goals

The initial platform must not attempt to:

- replace Angular CLI
- replace Vite
- become a general-purpose build system
- support every framework immediately
- rewrite every Prime component from scratch
- preserve every Prime internal implementation detail forever
- force identical APIs across frameworks
- make AI mandatory
- bundle AI/MCP dependencies into application runtime
- create a single mandatory corporate Design System
- continuously synchronize with Prime source
- depend on current commercial Prime packages

---

## 42. Key Strategic Outcome

The intended end state is:

```text
                         ULTIMATE PLATFORM
                                │
       ┌────────────────────────┼────────────────────────┐
       │                        │                        │
       ▼                        ▼                        ▼
   UI Platform             Developer Platform          AI Platform
       │                        │                        │
   UltimateUIX              Ultimate CLI            Ultimate MCP
       │                        │                        │
 ┌─────┼─────┐                 │                   Skills / LLM
 ↓     ↓     ↓                  │                        │
 NG   React  Vue                │                        │
 │     │     │                  │                        │
 └─────┼─────┘                  │                        │
       │                        │                        │
       ▼                        ▼                        ▼
 Components              Project Tooling        Component Knowledge
       │                                               │
       └───────────────────────┬───────────────────────┘
                               ↓
                       Ultimate Themes
```

Prime provides the historical implementation foundation.

Ultimate owns the resulting platform.

---

## 43. Current Status of Decisions

### DECIDED

- Ultimate is a standalone platform.
- Monorepo architecture.
- Independent packages.
- Framework-native implementations.
- Ultimate owns runtime implementation.
- No required Prime runtime dependency.
- Prime MIT source can be used as a verified baseline.
- Themes are independent.
- CLI is an orchestrator.
- MCP is optional tooling.
- Component metadata is first-class.
- AI/Skills/LLM context are part of the platform architecture.
- Independent package versioning.
- Changesets or equivalent release model.
- Continuous Prime synchronization is not required.

### PROVISIONAL

- Exact package names.
- Exact package boundaries.
- Exact PrimeUIX baseline.
- Exact React baseline architecture.
- Exact public selector prefix.
- Exact CLI command names.
- Exact metadata schema.
- Exact compatibility manifest format.

### DEFERRED

- Final corporate themes.
- Advanced AI behavior.
- Additional frameworks.
- Full automated migration system.
- Advanced design-token authoring tools.
- Public ecosystem strategy.

### OUT OF SCOPE FOR INITIAL PLATFORM

- Replacing framework build tools.
- Supporting every UI framework.
- Maintaining Prime API compatibility indefinitely.
- Automatic Prime feature synchronization.

---

## 44. First Implementation Rule

Before writing component migration code:

1. Verify the exact baselines.
2. Verify licenses.
3. Verify dependency closure.
4. Establish the monorepo.
5. Establish provenance tracking.
6. Establish CI.
7. Establish package boundaries.
8. Establish the first ADR set.
9. Establish the build/release mechanism.
10. Only then begin UIX/component extraction.

This order is mandatory because architectural and licensing mistakes become substantially more expensive after component migration begins.

---

## 45. Blueprint Governance

This document is the architecture baseline for Ultimate Platform v0.1.

It should be updated only when:

- a major architectural decision changes,
- a baseline changes,
- a package boundary changes,
- a dependency policy changes,
- a framework strategy changes,
- a licensing/provenance constraint changes,
- or a major AI/tooling architecture changes.

Implementation details should not be added here unless they affect architecture.

For implementation details, use phase specifications and implementation plans.
