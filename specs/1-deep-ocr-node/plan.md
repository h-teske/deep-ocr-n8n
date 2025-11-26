# Implementation Plan: Deep-OCR n8n Community Node

**Branch**: `1-deep-ocr-node` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-deep-ocr-node/spec.md`

## Summary

Build a custom n8n community node that integrates with the Deep-OCR API service to extract text content from documents. The node supports two output modes: full-text extraction (returns complete OCR text) and structured extraction (returns JSON with user-specified fields). Requires secure credential management for API key authentication.

## Technical Context

**Language/Version**: TypeScript 5.x with Node.js 22 (strict mode required per constitution)  
**Primary Dependencies**: n8n-workflow, n8n-core (peer dependencies only - zero external dependencies per VR-006)  
**Storage**: N/A (stateless node, credentials managed by n8n, no file system access per VR-008)  
**Testing**: Jest with ts-jest for unit tests, n8n workflow testing for integration  
**Target Platform**: n8n self-hosted and cloud instances (Node.js runtime)  
**Project Type**: Single project (n8n community node package)  
**Performance Goals**: <30 seconds for standard OCR operations per constitution  
**Constraints**: <512MB memory, no env vars (VR-007), no fs access (VR-008), zero dependencies (VR-006)  
**Scale/Scope**: Single node with credentials, ~5 source files, ~10 test files  
**Tooling**: n8n-node CLI tool for package scaffolding (VR-001), @n8n/scan-community-package for linting (VR-010)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Code Quality First**: ✅ TypeScript strict mode will be enabled in tsconfig.json, ESLint with n8n-nodes-base ruleset, JSDoc for all public methods  
**Test-Driven Development**: ✅ Jest test framework selected, TDD workflow: write tests → fail → implement → pass, integration tests for API calls  
**User Experience Consistency**: ✅ n8n node description patterns documented, standardized error messages with actionable guidance  
**Performance Standards**: ✅ 30-second timeout configured, memory-efficient stream handling for large documents, async/await non-blocking  
**Quality Gates**: ✅ All gates achievable - TypeScript strict, Jest coverage, ESLint, manual n8n testing planned

**Initial Assessment**: All constitution principles can be satisfied with planned architecture.

### n8n Verification Requirements Check (NON-NEGOTIABLE)

| Requirement                   | Status     | Implementation                                |
| ----------------------------- | ---------- | --------------------------------------------- |
| VR-001: n8n-node tool         | ✅ PLANNED | Use `npx n8n-node-dev new` for scaffolding    |
| VR-002: npm/GitHub match      | ✅ PLANNED | Repository URL in package.json matches GitHub |
| VR-003: Author match          | ✅ PLANNED | Consistent author in npm and GitHub           |
| VR-004: Public repo           | ✅ PLANNED | h-teske/deep-ocr-n8n is public                |
| VR-005: MIT license           | ✅ PLANNED | LICENSE file with MIT                         |
| VR-006: Zero dependencies     | ✅ PLANNED | Only peerDependencies for n8n-workflow        |
| VR-007: No env vars           | ✅ PLANNED | All config via node parameters                |
| VR-008: No file system        | ✅ PLANNED | Binary data via n8n helpers only              |
| VR-009: Params only           | ✅ PLANNED | All data through INodeProperties              |
| VR-010: Linter pass           | ✅ PLANNED | `npx @n8n/scan-community-package` in CI       |
| VR-011: English only          | ✅ PLANNED | All text in English                           |
| VR-012: Documentation         | ✅ PLANNED | README with examples                          |
| VR-013: TypeScript guidelines | ✅ PLANNED | Strict mode, n8n patterns                     |
| VR-014: Error handling        | ✅ PLANNED | NodeApiError, NodeOperationError              |

### Post-Design Re-Check (Phase 1 Complete)

| Principle                   | Status  | Evidence                                                                                           |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| Code Quality First          | ✅ PASS | TypeScript strict mode in tsconfig, ESLint config, JSDoc requirements in quickstart                |
| Test-Driven Development     | ✅ PASS | Jest + jest-mock-extended configured, test structure defined, TDD workflow in quickstart           |
| User Experience Consistency | ✅ PASS | n8n conventions documented in research, displayOptions for conditional UI, NodeApiError for errors |
| Performance Standards       | ✅ PASS | 30s timeout aligns with spec SC-005, async/await pattern, no blocking operations                   |
| Quality Gates               | ✅ PASS | All gates achievable: TSC, Jest coverage, ESLint, manual testing documented                        |

**Final Assessment**: Architecture passes all constitution gates. Ready for task generation.

## Project Structure

### Documentation (this feature)

```text
specs/1-deep-ocr-node/
├── plan.md              # This file
├── research.md          # Phase 0: n8n node development best practices
├── data-model.md        # Phase 1: Entities and data flow
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API contracts
│   └── deep-ocr-api.yaml
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
nodes/
└── DeepOcr/
    ├── DeepOcr.node.ts       # Main node implementation
    ├── DeepOcr.node.json     # Node metadata/description
    └── deepocr.svg           # Node icon

credentials/
└── DeepOcrApi.credentials.ts # Credential type definition

package.json                   # Node package configuration
tsconfig.json                  # TypeScript configuration
.eslintrc.js                   # ESLint configuration

tests/
├── unit/
│   ├── DeepOcr.node.test.ts  # Node logic unit tests
│   └── credentials.test.ts    # Credential validation tests
└── integration/
    └── api-integration.test.ts # Deep-OCR API integration tests
```

**Structure Decision**: Standard n8n community node structure with separate `nodes/` and `credentials/` directories following n8n-nodes-base conventions. Tests organized by type (unit/integration) per constitution TDD requirements.

## Complexity Tracking

> No constitution violations identified. Architecture follows standard n8n community node patterns.

| Aspect            | Decision                                | Rationale                                                          |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Single node file  | DeepOcr.node.ts contains all operations | Simple API with 2 output modes doesn't warrant operation splitting |
| No external state | Stateless design                        | n8n manages credentials and workflow state                         |
| Direct API calls  | No intermediate service layer           | Single API endpoint doesn't require abstraction                    |
