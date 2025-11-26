<!--
Sync Impact Report:
- Version change: initial template → 1.0.0
- Added principles: Code Quality First, Test-Driven Development, User Experience Consistency, Performance Standards
- Added sections: Quality Gates, Development Standards
- Templates requiring updates: ✅ All templates align with constitution requirements
- Follow-up TODOs: None
-->

# Deep-OCR n8n Community Node Constitution

## Core Principles

### I. Code Quality First (NON-NEGOTIABLE)

All code MUST follow TypeScript strict mode with comprehensive type safety. Every function and class MUST have JSDoc documentation. Code MUST be self-documenting with clear, descriptive names in English. No code merges without proper error handling using try/catch blocks for async operations. ESLint rules are enforced without exceptions.

**Rationale**: As an n8n community node handling OCR operations, code quality directly impacts user trust and node reliability. Poor code quality leads to runtime errors that break user workflows.

### II. Test-Driven Development (NON-NEGOTIABLE)

TDD methodology is strictly enforced: Tests written → User approved → Tests fail → Implementation → Tests pass. Every public method, API endpoint, and user-facing feature MUST have corresponding tests. Integration tests are mandatory for Deep-OCR service interactions and n8n node lifecycle events.

**Rationale**: OCR operations involve complex data transformations and external service dependencies. TDD ensures reliability and prevents regressions that could corrupt user data processing workflows.

### III. User Experience Consistency

n8n node interface MUST follow n8n UX conventions and design patterns. All user-facing error messages MUST be actionable and provide clear next steps. Node parameters MUST have consistent naming, validation, and help text. Performance feedback MUST be provided for long-running OCR operations.

**Rationale**: Users expect consistent behavior across all n8n nodes. Inconsistent UX creates confusion and reduces adoption of the Deep-OCR capabilities.

### IV. Performance Standards

OCR operations MUST complete within 30 seconds for standard document sizes (<10MB). Memory usage MUST not exceed 512MB per operation. The node MUST handle concurrent requests gracefully without blocking the n8n execution engine. All performance metrics MUST be logged for monitoring.

**Rationale**: n8n workflows often process multiple documents in parallel. Poor performance creates bottlenecks that impact entire workflow execution and user productivity.

## Quality Gates

All features MUST pass the following gates before merge:

- TypeScript compilation with zero errors and warnings
- 100% test coverage for new code paths
- ESLint compliance with project configuration
- Manual testing in n8n workflow context
- Performance validation against defined standards
- Code review approval from project maintainers

## Development Standards

**Language Requirements**: All code, comments, and documentation MUST be written in English. Commit messages MUST follow conventional commit format in English.

**Git Workflow**: Never commit directly to main branch. All changes MUST go through feature branches with descriptive names (feature/, fix/, docs/, refactor/, test/). Pull requests MUST use the provided PR template and include all required sections.

**Technology Stack**: Node.js 22 with TypeScript, n8n Community Node Framework, GitHub Spec-kit for structured development. Dependencies MUST be justified and approved before addition.

## Governance

This constitution supersedes all other development practices and guidelines. All Pull Requests MUST demonstrate compliance with these principles through automated checks and manual review.

Amendments require:

1. Documented justification for changes
2. Impact assessment on existing codebase
3. Migration plan for non-compliant code
4. Approval from project maintainers

Version bumps follow semantic versioning:

- MAJOR: Breaking changes to principles or governance
- MINOR: New principles or expanded guidance
- PATCH: Clarifications and refinements

Use `.github/copilot-instructions.md` for runtime development guidance and specific implementation details.

**Version**: 1.0.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-11-26
