# Tasks: Deep-OCR n8n Community Node

**Input**: Design documents from `/specs/1-deep-ocr-node/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD is NON-NEGOTIABLE per constitution. Tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:

- **Node files**: `nodes/DeepOcr/`
- **Credentials**: `credentials/`
- **Tests**: `tests/unit/`, `tests/integration/`
- **Config**: Root level (`package.json`, `tsconfig.json`, etc.)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization with n8n-node tool and verification-compliant structure

- [x] T001 Initialize project using `npx n8n-node-dev new` for n8n verification compliance (VR-001)
- [x] T002 [P] Create MIT LICENSE file at repository root (VR-005)
- [x] T003 [P] Configure package.json with zero dependencies, only peerDependencies for n8n-workflow (VR-006)
- [x] T004 [P] Configure tsconfig.json with TypeScript strict mode enabled
- [x] T005 [P] Configure .eslintrc.js with n8n-nodes-base ruleset
- [x] T006 [P] Setup Jest configuration in jest.config.js with ts-jest
- [x] T007 [P] Create index.ts to export nodes and credentials
- [x] T008 Add npm scripts: build, dev, lint, lint:n8n, test, test:coverage in package.json

**Checkpoint**: Project skeleton ready, `npm run build` and `npm run lint:n8n` pass with empty exports

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create node icon deepocr.svg in nodes/DeepOcr/
- [x] T010 Create base DeepOcr.node.ts skeleton with INodeType interface in nodes/DeepOcr/
- [x] T011 Define node description metadata (displayName, name, icon, group, version, inputs, outputs) in nodes/DeepOcr/DeepOcr.node.ts
- [x] T012 Create base DeepOcrApi.credentials.ts skeleton with ICredentialType interface in credentials/
- [x] T013 Setup error handling utilities using NodeApiError and NodeOperationError patterns
- [ ] T014 Verify build passes: `npm run build` compiles without errors
- [ ] T015 Verify n8n linter passes: `npm run lint:n8n` with zero errors (VR-010)

**Checkpoint**: Foundation ready - `npm run build` and `npm run lint:n8n` pass, node skeleton loads in n8n

---

## Phase 3: User Story 3 - Configure API Authentication (Priority: P1) 🔐

**Goal**: Implement secure credential management for Deep-OCR API key

**Independent Test**: Create credentials in n8n, verify API key is stored and Authorization header is sent

> **Note**: US3 (Authentication) is implemented first because US1 depends on working credentials

### Tests for User Story 3 (TDD - Write First, Must Fail)

- [x] T016 [P] [US3] Write unit test for credential properties validation in tests/unit/credentials.test.ts
- [x] T017 [P] [US3] Write unit test for IAuthenticateGeneric Bearer token header in tests/unit/credentials.test.ts
- [x] T018 [US3] Run tests and verify they FAIL (no implementation yet)

### Implementation for User Story 3

- [x] T019 [US3] Implement apiKey property with password type in credentials/DeepOcrApi.credentials.ts
- [x] T020 [US3] Implement IAuthenticateGeneric with Bearer token header in credentials/DeepOcrApi.credentials.ts
- [x] T021 [US3] Add credential test request to validate API key in credentials/DeepOcrApi.credentials.ts
- [x] T022 [US3] Add credentials reference to node description in nodes/DeepOcr/DeepOcr.node.ts
- [ ] T023 [US3] Run tests and verify they PASS
- [ ] T024 [US3] Manual test: Create credentials in n8n UI, verify secure storage

**Checkpoint**: Credentials work independently - can create, save, and select Deep-OCR API credentials in n8n

---

## Phase 4: User Story 1 - Extract Full Text from Document (Priority: P1) 🎯 MVP

**Goal**: Upload document and receive complete text content as string

**Independent Test**: Upload PDF/image, select "text" output, verify extracted text returned

### Tests for User Story 1 (TDD - Write First, Must Fail)

- [x] T025 [P] [US1] Write unit test for binaryPropertyName parameter parsing in tests/unit/DeepOcr.node.test.ts
- [x] T026 [P] [US1] Write unit test for outputFormat parameter (default: text) in tests/unit/DeepOcr.node.test.ts
- [x] T027 [P] [US1] Write unit test for binary data extraction using assertBinaryData and file size validation (max 10MB) in tests/unit/DeepOcr.node.test.ts
- [x] T028 [P] [US1] Write unit test for API request construction with FormData in tests/unit/DeepOcr.node.test.ts
- [x] T029 [P] [US1] Write unit test for text mode response transformation in tests/unit/DeepOcr.node.test.ts
- [x] T030 [P] [US1] Write unit test for error handling (auth failure, invalid file, API error) in tests/unit/DeepOcr.node.test.ts
- [x] T031 [P] [US1] Write unit test for continueOnFail behavior in tests/unit/DeepOcr.node.test.ts
- [x] T032 [US1] Run tests and verify they FAIL (no implementation yet)

### Implementation for User Story 1

- [x] T033 [US1] Add binaryPropertyName parameter to node properties in nodes/DeepOcr/DeepOcr.node.ts
- [x] T034 [US1] Add outputFormat parameter with 'text' and 'structured' options in nodes/DeepOcr/DeepOcr.node.ts
- [x] T035 [US1] Implement execute() method skeleton with input loop in nodes/DeepOcr/DeepOcr.node.ts
- [x] T036 [US1] Implement binary data extraction using this.helpers.assertBinaryData() in nodes/DeepOcr/DeepOcr.node.ts
- [x] T037 [US1] Implement binary buffer retrieval using this.helpers.getBinaryDataBuffer() in nodes/DeepOcr/DeepOcr.node.ts
- [x] T038 [US1] Implement MIME type validation for supported formats (PDF, PNG, JPG, JPEG, WebP) and file size validation (max 10MB) in nodes/DeepOcr/DeepOcr.node.ts
- [x] T039 [US1] Implement API request with FormData using this.helpers.request() in nodes/DeepOcr/DeepOcr.node.ts
- [x] T040 [US1] Implement text mode response handling (return { text: response }) in nodes/DeepOcr/DeepOcr.node.ts
- [x] T041 [US1] Implement error handling with NodeApiError for API failures in nodes/DeepOcr/DeepOcr.node.ts
- [x] T042 [US1] Implement continueOnFail() support for graceful error handling in nodes/DeepOcr/DeepOcr.node.ts
- [ ] T043 [US1] Run tests and verify they PASS
- [ ] T044 [US1] Manual test: Upload PDF in n8n, verify text extraction works

**Checkpoint**: MVP complete - Full text extraction works independently with any supported document format

---

## Phase 5: User Story 2 - Extract Structured Fields from Document (Priority: P2)

**Goal**: Specify fields to extract and receive JSON object with those fields

**Independent Test**: Upload invoice, enter "sender,amount,date", verify JSON with those fields returned

### Tests for User Story 2 (TDD - Write First, Must Fail)

- [x] T045 [P] [US2] Write unit test for fields parameter (conditional display) in tests/unit/DeepOcr.node.test.ts
- [x] T046 [P] [US2] Write unit test for structured mode API request with fields query param in tests/unit/DeepOcr.node.test.ts
- [x] T047 [P] [US2] Write unit test for structured mode response transformation in tests/unit/DeepOcr.node.test.ts
- [x] T048 [P] [US2] Write unit test for empty fields handling in tests/unit/DeepOcr.node.test.ts
- [x] T049 [US2] Run tests and verify they FAIL (no implementation yet)

### Implementation for User Story 2

- [x] T050 [US2] Add fields parameter with displayOptions.show for structured mode in nodes/DeepOcr/DeepOcr.node.ts
- [x] T051 [US2] Implement fields query parameter in API request construction in nodes/DeepOcr/DeepOcr.node.ts
- [x] T052 [US2] Implement structured mode response handling (return JSON object) in nodes/DeepOcr/DeepOcr.node.ts
- [x] T053 [US2] Handle empty fields case (API extracts all detectable fields automatically) in nodes/DeepOcr/DeepOcr.node.ts
- [ ] T054 [US2] Run tests and verify they PASS
- [ ] T055 [US2] Manual test: Upload invoice in n8n with fields, verify structured JSON output

**Checkpoint**: Structured extraction works - can specify fields and receive JSON with extracted values

---

## Phase 6: Polish & Verification Compliance

**Purpose**: Documentation, final verification, and cross-cutting concerns

### Documentation (VR-012)

- [x] T056 [P] Create comprehensive README.md with usage instructions
- [x] T057 [P] Add example workflow JSON to README.md
- [x] T058 [P] Document authentication setup process in README.md
- [x] T059 [P] Add JSDoc comments to all public methods in node and credential files

### Verification & Quality Gates

- [ ] T060 Run full test suite with coverage: `npm run test:coverage`
- [ ] T061 Verify TypeScript strict mode compliance: `npm run build` with zero warnings
- [ ] T062 Verify ESLint compliance: `npm run lint` with zero errors
- [ ] T063 Run n8n community package linter: `npm run lint:n8n` (VR-010)
- [x] T064 Verify zero dependencies in package.json (VR-006)
- [x] T065 Verify no process.env usage in source files (VR-007)
- [x] T066 Verify no fs module usage in source files (VR-008)
- [x] T067 Verify all text is English only (VR-011)
- [ ] T068 Manual end-to-end test in n8n: full workflow with text and structured modes
- [ ] T069 Update package.json version and prepare for npm publish

**Checkpoint**: All verification requirements met, package ready for npm publish and n8n verification

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          → No dependencies, start immediately
         ↓
Phase 2 (Foundational)   → Depends on Phase 1 completion
         ↓
Phase 3 (US3: Auth)      → Depends on Phase 2 (credentials needed first)
         ↓
Phase 4 (US1: Text)      → Depends on Phase 3 (needs working auth)
         ↓
Phase 5 (US2: Structured)→ Depends on Phase 4 (extends text mode)
         ↓
Phase 6 (Polish)         → Depends on all user stories complete
```

### User Story Dependencies

- **US3 (Auth)**: Prerequisite for all API operations - implement FIRST
- **US1 (Text)**: Core functionality, depends on US3 - implement SECOND (MVP)
- **US2 (Structured)**: Extends US1, adds fields parameter - implement THIRD

### Within Each User Story

1. Tests MUST be written FIRST and FAIL before implementation (TDD)
2. Implementation follows test specifications
3. Tests MUST PASS after implementation
4. Manual testing in n8n UI validates real-world behavior

### Parallel Opportunities

**Phase 1 Parallel Tasks (T002-T007)**:

```bash
# All setup config files can be created in parallel
T002: LICENSE
T003: package.json
T004: tsconfig.json
T005: .eslintrc.js
T006: jest.config.js
T007: index.ts
```

**US3 Test Tasks (T016-T017)**:

```bash
# Tests can be written in parallel
T016: credential properties test
T017: Bearer token header test
```

**US1 Test Tasks (T025-T031)**:

```bash
# All unit tests can be written in parallel
T025-T031: All US1 unit tests
```

**US2 Test Tasks (T045-T048)**:

```bash
# All unit tests can be written in parallel
T045-T048: All US2 unit tests
```

**Phase 6 Documentation (T056-T059)**:

```bash
# Documentation tasks can be done in parallel
T056-T059: README sections and JSDoc
```

---

## Implementation Strategy

### MVP First (US3 + US1 Only)

1. Complete Phase 1: Setup ✓
2. Complete Phase 2: Foundational ✓
3. Complete Phase 3: US3 (Authentication) ✓
4. Complete Phase 4: US1 (Text extraction) ✓
5. **STOP and VALIDATE**: Test full text extraction in n8n
6. Deploy/publish if ready - this is a functional MVP!

### Full Feature Delivery

1. Complete MVP (US3 + US1)
2. Add Phase 5: US2 (Structured extraction)
3. Complete Phase 6: Polish & Verification
4. Run all verification checks (VR-001 to VR-014)
5. Publish to npm

---

## Task Summary

| Phase                   | Tasks                | Purpose                      |
| ----------------------- | -------------------- | ---------------------------- |
| Phase 1: Setup          | T001-T008 (8 tasks)  | Project initialization       |
| Phase 2: Foundational   | T009-T015 (7 tasks)  | Core infrastructure          |
| Phase 3: US3 Auth       | T016-T024 (9 tasks)  | Credential management        |
| Phase 4: US1 Text       | T025-T044 (20 tasks) | Full text extraction (MVP)   |
| Phase 5: US2 Structured | T045-T055 (11 tasks) | Structured field extraction  |
| Phase 6: Polish         | T056-T069 (14 tasks) | Documentation & verification |
| **Total**               | **69 tasks**         |                              |

### Tasks by User Story

| User Story             | Tasks                | Priority |
| ---------------------- | -------------------- | -------- |
| US3: Authentication    | 9 tasks (T016-T024)  | P1       |
| US1: Text Extraction   | 20 tasks (T025-T044) | P1 (MVP) |
| US2: Structured Fields | 11 tasks (T045-T055) | P2       |

### Parallel Opportunities

- **Setup Phase**: 6 tasks can run in parallel (T002-T007)
- **US3 Tests**: 2 tasks can run in parallel (T016-T017)
- **US1 Tests**: 7 tasks can run in parallel (T025-T031)
- **US2 Tests**: 4 tasks can run in parallel (T045-T048)
- **Documentation**: 4 tasks can run in parallel (T056-T059)
