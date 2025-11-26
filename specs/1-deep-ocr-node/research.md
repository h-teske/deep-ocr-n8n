# Research: Deep-OCR n8n Community Node

**Feature Branch**: `1-deep-ocr-node`  
**Created**: 2025-11-26  
**Purpose**: Resolve technical unknowns and document best practices for n8n node development

## Research Areas

### 1. n8n Community Node Structure

**Decision**: Standard n8n community node structure with separate `nodes/` and `credentials/` directories

**Rationale**:

- `package.json` must contain `n8n.nodes` and `n8n.credentials` arrays pointing to compiled JS files
- Node.ts contains `INodeType` implementation with `description` (metadata, parameters) and `execute()` (logic)
- Credentials.ts contains `ICredentialType` implementation for authentication
- Separation improves maintainability and follows n8n-nodes-base conventions

**Alternatives Considered**:

- Monolithic structure (credentials in node file) → Rejected due to poor maintainability
- Separate GenericFunctions.ts → Recommended for reusable API calls, but not required for simple nodes

### 2. Bearer Token Authentication

**Decision**: Use `IAuthenticateGeneric` with `type: 'generic'` for Bearer token authentication

**Rationale**:

- `IAuthenticateGeneric` is the cleanest method for API key/Bearer auth
- The `authenticate` block is automatically applied to all requests
- `test` property enables automatic credential validation in UI
- n8n handles secure storage and encryption automatically

**Implementation Pattern**:

```typescript
authenticate: IAuthenticateGeneric = {
  type: "generic",
  properties: {
    headers: {
      Authorization: "=Bearer {{$credentials.apiKey}}",
    },
  },
};
```

**Alternatives Considered**:

- Manual headers in GenericFunctions → More code, error-prone
- OAuth2 → Overcomplicated for simple API key auth

### 3. Binary Data Handling (Document Upload)

**Decision**: Use `assertBinaryData()` + `getBinaryDataBuffer()` + FormData pattern

**Rationale**:

- `assertBinaryData()`: Automatically throws error if no binary data present
- `getBinaryDataBuffer()`: Returns actual data as Buffer for upload
- FormData with `value/options` pattern: Standard for multipart/form-data uploads
- Supports PDF, PNG, JPG, JPEG, WebP as required by spec

**Implementation Pattern**:

```typescript
const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
const dataBuffer = await this.helpers.getBinaryDataBuffer(
  i,
  binaryPropertyName
);

const formData = {
  file: {
    value: dataBuffer,
    options: {
      filename: binaryData.fileName,
      contentType: binaryData.mimeType,
    },
  },
};
```

**Alternatives Considered**:

- Base64 encoding in JSON body → Inefficient for large files, not supported by Deep-OCR API

### 4. Conditional Parameter Display

**Decision**: Use `displayOptions.show` for showing "fields" parameter only when `output_format === 'structured'`

**Rationale**:

- `displayOptions.show`: Parameter is displayed ONLY when ALL conditions are met
- Clean UX - users only see relevant options
- Matches n8n conventions for conditional parameters

**Implementation Pattern**:

```typescript
{
  displayName: 'Fields to Extract',
  name: 'fields',
  type: 'string',
  default: '',
  displayOptions: {
    show: {
      output_format: ['structured'],
    },
  },
}
```

**Alternatives Considered**:

- Always showing fields with validation → Confusing UX when not applicable

### 5. Error Handling Patterns

**Decision**: Use `NodeApiError` for API errors and `NodeOperationError` for operation errors, with `continueOnFail()` support

**Rationale**:

- `NodeApiError`: For HTTP/API errors - automatically extracts httpCode, message from response
- `NodeOperationError`: For logic/validation errors in node
- `continueOnFail()`: Allows workflow continuation on errors (user-configurable)
- `itemIndex` parameter: Critical for error localization in UI

**Implementation Pattern**:

```typescript
catch (error) {
  if (this.continueOnFail()) {
    returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
    continue;
  }
  throw new NodeApiError(this.getNode(), error, {
    itemIndex: i,
    message: 'OCR processing failed',
    description: error.response?.data?.message,
  });
}
```

**Alternatives Considered**:

- Generic Error throws → Poor UX, no context for debugging

### 6. Testing Framework and Patterns

**Decision**: Jest with `jest-mock-extended` for unit tests

**Rationale**:

- `jest-mock-extended`: Enables deep mocking of complex interfaces
- `mockDeep<IExecuteFunctions>()`: Mocks all nested properties
- Spy pattern: `jest.spyOn` for GenericFunctions enables API call verification
- Matches n8n-nodes-base testing conventions

**Test Structure**:

```
tests/
├── unit/
│   ├── DeepOcr.node.test.ts    # Node logic unit tests
│   └── credentials.test.ts      # Credential validation tests
└── integration/
    └── api-integration.test.ts  # Deep-OCR API integration tests
```

**Alternatives Considered**:

- Vitest → Similar to Jest but n8n primarily uses Jest
- NodeTestHarness → For E2E tests with real workflows (out of scope for MVP)

## Technical Decisions Summary

| Aspect          | Decision                                          | Confidence |
| --------------- | ------------------------------------------------- | ---------- |
| Node Structure  | Standard n8n community node layout                | High       |
| Authentication  | IAuthenticateGeneric with Bearer token            | High       |
| Binary Handling | assertBinaryData + getBinaryDataBuffer + FormData | High       |
| Conditional UI  | displayOptions.show for structured fields         | High       |
| Error Handling  | NodeApiError + continueOnFail pattern             | High       |
| Testing         | Jest + jest-mock-extended                         | High       |

## Dependencies Identified

**CRITICAL: Zero External Dependencies (VR-006)**

The package MUST have zero dependencies in package.json. Only peerDependencies are allowed.

| Package      | Type           | Purpose                       | Version |
| ------------ | -------------- | ----------------------------- | ------- |
| n8n-workflow | peerDependency | Core n8n types and interfaces | \*      |
| n8n-core     | peerDependency | Node execution helpers        | \*      |

**Development Dependencies Only** (not shipped with package):

| Package                     | Purpose                     | Version |
| --------------------------- | --------------------------- | ------- |
| typescript                  | TypeScript compiler         | ^5.0.0  |
| jest                        | Testing framework           | ^29.0.0 |
| jest-mock-extended          | Deep mocking for tests      | ^3.0.0  |
| ts-jest                     | TypeScript Jest support     | ^29.0.0 |
| @types/node                 | Node.js type definitions    | ^20.0.0 |
| @n8n/scan-community-package | n8n linter for verification | latest  |

### 7. n8n Community Node Verification Guidelines

**Decision**: Follow all verification requirements to enable n8n verification eligibility

**Requirements Summary**:

| Requirement                 | Implementation                                       |
| --------------------------- | ---------------------------------------------------- |
| Use n8n-node tool           | `npx n8n-node-dev new` for scaffolding               |
| Package source verification | npm repo URL matches GitHub, author matches          |
| MIT License                 | LICENSE file at root                                 |
| Zero dependencies           | Only peerDependencies for n8n-workflow               |
| No env vars                 | All config via node parameters                       |
| No file system access       | Binary data via n8n helpers only                     |
| English only                | All UI text, docs, errors in English                 |
| Linter pass                 | `npx @n8n/scan-community-package n8n-nodes-deep-ocr` |
| Documentation               | README with usage, examples, auth details            |

**Rationale**:

- Verification enables discovery in n8n's node panel
- Available to all deployment types (self-hosted and cloud)
- Quality assurance for end users
- Lightweight package without external dependencies

**Verification Linter Command**:

```bash
npx @n8n/scan-community-package n8n-nodes-deep-ocr
```

**Forbidden Patterns**:

```typescript
// ❌ FORBIDDEN: Environment variables
process.env.API_KEY

// ❌ FORBIDDEN: File system access
import fs from 'fs';
fs.readFileSync('...');

// ❌ FORBIDDEN: External dependencies in package.json
"dependencies": { "axios": "^1.0.0" }  // NOT ALLOWED
```

**Allowed Patterns**:

```typescript
// ✅ ALLOWED: n8n built-in request helper
await this.helpers.request(options);

// ✅ ALLOWED: n8n binary data helpers
const buffer = await this.helpers.getBinaryDataBuffer(i, propertyName);

// ✅ ALLOWED: Node parameters for configuration
const apiUrl = this.getNodeParameter("apiUrl", i) as string;
```

## Open Questions Resolved

1. ✅ How to handle multipart file uploads → FormData pattern with value/options
2. ✅ How to conditionally show parameters → displayOptions.show
3. ✅ How to implement credential testing → ICredentialTestRequest with health endpoint
4. ✅ How to properly mock n8n interfaces for testing → jest-mock-extended
5. ✅ How to ensure verification eligibility → Follow VR-001 to VR-014, use n8n-node tool, zero dependencies
