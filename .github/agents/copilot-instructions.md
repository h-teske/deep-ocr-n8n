# Deep-OCR n8n Community Node Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-26

## Active Technologies

- **Language**: TypeScript 5.x with Node.js 22 (strict mode)
- **Framework**: n8n Community Node Framework (n8n-workflow, n8n-core)
- **Testing**: Jest with ts-jest, jest-mock-extended
- **Linting**: ESLint with n8n-nodes-base ruleset
- **Package Manager**: npm

## Project Structure

```text
deep-ocr-n8n/
├── nodes/
│   └── DeepOcr/
│       ├── DeepOcr.node.ts       # Main node implementation
│       ├── DeepOcr.node.json     # Node metadata (optional)
│       └── deepocr.svg           # Node icon
├── credentials/
│   └── DeepOcrApi.credentials.ts # API credential type
├── tests/
│   ├── unit/
│   │   ├── DeepOcr.node.test.ts
│   │   └── credentials.test.ts
│   └── integration/
│       └── api-integration.test.ts
├── package.json
├── tsconfig.json
├── .eslintrc.js
└── index.ts                      # Exports nodes and credentials
```

## Commands

### Build

```bash
npm run build        # Compile TypeScript
npm run dev          # Watch mode
```

### Test

```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage
```

### Lint

```bash
npm run lint         # Check linting
npm run lint:fix     # Fix linting issues
```

### Link for n8n Testing

```bash
npm link
# In n8n directory:
npm link n8n-nodes-deep-ocr
```

## Code Style

### TypeScript

- Strict mode enabled
- All public methods must have JSDoc documentation
- Use async/await for asynchronous operations
- Error handling with try/catch for all async operations

### n8n Node Conventions

- Use `INodeType` interface for node definition
- Use `ICredentialType` for credential definition
- Use `NodeApiError` for API errors
- Use `NodeOperationError` for operation errors
- Support `continueOnFail()` for graceful error handling
- Use `displayOptions` for conditional parameter display

### Testing

- TDD workflow: Tests first, then implementation
- Use `mockDeep<IExecuteFunctions>()` for mocking
- Test all error paths
- Integration tests for API calls

## Recent Changes

### 1-deep-ocr-node (2025-11-26)

- Initial feature: n8n community node for Deep-OCR service
- Added: DeepOcr.node.ts, DeepOcrApi.credentials.ts
- Technologies: TypeScript, n8n-workflow, Jest

<!-- MANUAL ADDITIONS START -->
<!-- Add custom guidelines here that should be preserved across updates -->
<!-- MANUAL ADDITIONS END -->
