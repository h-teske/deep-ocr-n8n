# Quickstart: Deep-OCR n8n Community Node Development

**Feature Branch**: `1-deep-ocr-node`  
**Created**: 2025-11-26  
**Purpose**: Developer setup guide for implementing and testing the node

## Prerequisites

- Node.js 22.x installed
- npm package manager
- Git
- Deep-OCR API key (for integration testing)
- n8n installed locally (for manual testing)

## Project Setup

### 1. Initialize with n8n-node Tool (REQUIRED for Verification)

```bash
# Clone the repository (if not already done)
git clone https://github.com/h-teske/deep-ocr-n8n.git
cd deep-ocr-n8n

# Switch to feature branch
git checkout 1-deep-ocr-node

# Use n8n-node tool for scaffolding (VR-001)
npx n8n-node-dev new

# Install dev dependencies only
npm install
```

### 2. Project Structure

After setup, your project should have this structure:

```
deep-ocr-n8n/
├── nodes/
│   └── DeepOcr/
│       ├── DeepOcr.node.ts
│       └── deepocr.svg
├── credentials/
│   └── DeepOcrApi.credentials.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── LICENSE                    # MIT License (VR-005)
├── README.md                  # Documentation (VR-012)
└── specs/
    └── 1-deep-ocr-node/
```

### 3. package.json Configuration (Verification Compliant)

**CRITICAL**: Zero dependencies, only peerDependencies and devDependencies (VR-006)

```json
{
  "name": "n8n-nodes-deep-ocr",
  "version": "0.1.0",
  "description": "n8n community node for Deep-OCR service",
  "license": "MIT",
  "homepage": "https://github.com/h-teske/deep-ocr-n8n",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/h-teske/deep-ocr-n8n.git"
  },
  "keywords": ["n8n", "n8n-community-node-package", "ocr", "document"],
  "main": "dist/index.js",
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/DeepOcrApi.credentials.js"],
    "nodes": ["dist/nodes/DeepOcr/DeepOcr.node.js"]
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  },
  "devDependencies": {
    "@n8n/scan-community-package": "latest",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "jest-mock-extended": "^3.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "lint:n8n": "npx @n8n/scan-community-package .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prepublishOnly": "npm run lint:n8n && npm run build"
  }
}
```

## Development Workflow

### 1. TDD Cycle (Per Constitution)

Follow the Test-Driven Development cycle:

```
1. Write test (Red)     → tests/unit/DeepOcr.node.test.ts
2. Run test (Fail)      → npm test
3. Implement (Green)    → nodes/DeepOcr/DeepOcr.node.ts
4. Run test (Pass)      → npm test
5. Refactor            → Clean up code
6. Repeat
```

### 2. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/unit/DeepOcr.node.test.ts
```

### 3. Building the Node

```bash
# Compile TypeScript
npm run build

# Watch mode for development
npm run dev
```

### 4. Local n8n Testing

Option A: Link the package locally

```bash
# In the node project directory
npm link

# In your n8n installation
npm link n8n-nodes-deep-ocr

# Restart n8n
n8n start
```

Option B: Use n8n custom nodes directory

```bash
# Copy built files to n8n custom directory
cp -r dist/* ~/.n8n/custom/
```

## Key Files to Implement

### 1. Credentials (Priority: P1)

`credentials/DeepOcrApi.credentials.ts`:

- API key input with password type
- Bearer token authentication
- Credential test endpoint

### 2. Node Implementation (Priority: P1)

`nodes/DeepOcr/DeepOcr.node.ts`:

- Node description with parameters
- Binary data handling
- API request with FormData
- Response processing
- Error handling

### 3. Tests (Priority: P1)

`tests/unit/DeepOcr.node.test.ts`:

- Mock IExecuteFunctions
- Test text output mode
- Test structured output mode
- Test error handling
- Test continueOnFail behavior

## Testing Checklist

### Unit Tests

- [ ] Credentials validation
- [ ] Parameter parsing
- [ ] Binary data extraction
- [ ] API request construction
- [ ] Response transformation (text mode)
- [ ] Response transformation (structured mode)
- [ ] Error handling (auth failure)
- [ ] Error handling (validation error)
- [ ] Error handling (API error)
- [ ] continueOnFail behavior

### Integration Tests

- [ ] Real API call with test document
- [ ] Text extraction from PDF
- [ ] Text extraction from image
- [ ] Structured extraction with fields
- [ ] Invalid credential handling

### Manual Tests (n8n UI)

- [ ] Node appears in node palette
- [ ] Credential creation works
- [ ] Parameter UI displays correctly
- [ ] Fields input shows only for structured mode
- [ ] Successful text extraction
- [ ] Successful structured extraction
- [ ] Error messages display correctly

## Environment Variables

**⚠️ IMPORTANT (VR-007)**: Environment variables are FORBIDDEN in production code!

For integration testing ONLY (test files, not shipped code):

```bash
# .env.test (do not commit, testing only)
DEEP_OCR_API_KEY=your_api_key_here
DEEP_OCR_API_URL=https://api.deep-ocr.com
```

**In production code, all configuration MUST come through node parameters.**

## n8n Verification Checklist

Before publishing, ensure all verification requirements are met:

### Package Requirements (VR-001 to VR-005)

- [ ] Package created with `npx n8n-node-dev new`
- [ ] npm repository URL matches GitHub repository
- [ ] Package author matches between npm and GitHub
- [ ] Repository is public with working git link
- [ ] MIT license file present

### Code Requirements (VR-006 to VR-010)

- [ ] Zero dependencies in package.json (only peerDependencies)
- [ ] No `process.env` usage in production code
- [ ] No `fs` module or file system access
- [ ] All data passed through node parameters
- [ ] `npx @n8n/scan-community-package .` passes

### Documentation Requirements (VR-011 to VR-014)

- [ ] All interface text in English
- [ ] README with usage instructions
- [ ] README with example workflows
- [ ] README with authentication details
- [ ] Proper error handling implemented

### Run Verification Linter

```bash
npm run lint:n8n
# or directly:
npx @n8n/scan-community-package n8n-nodes-deep-ocr
```

## Common Issues

### TypeScript Compilation Errors

```bash
# Ensure correct TypeScript version
npm install typescript@^5.0.0

# Check tsconfig.json strict mode
```

### n8n Node Not Appearing

- Verify package.json n8n configuration
- Check build output in dist/
- Restart n8n after linking

### Test Mocking Issues

- Use `mockDeep<IExecuteFunctions>()` from jest-mock-extended
- Ensure all helper methods are mocked

### Verification Linter Failures

Common issues and fixes:

- **External dependencies**: Move to devDependencies or remove
- **Environment variable usage**: Replace with node parameters
- **File system access**: Use n8n binary helpers instead

## Resources

- [n8n Node Development Docs](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Community Node Verification](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/)
- [n8n-nodes-base Repository](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base)
- [Deep-OCR API Documentation](./contracts/deep-ocr-api.yaml)
- [Feature Specification](./spec.md)
- [Research Findings](./research.md)
