# Feature Specification: Deep-OCR n8n Community Node

**Feature Branch**: `1-deep-ocr-node`  
**Created**: 2025-11-26  
**Status**: Draft  
**Input**: User description: "Build a custom n8n node for the Deep-OCR service that allows uploading documents and getting content as fulltext or structured fields back"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Extract Full Text from Document (Priority: P1)

As an n8n workflow user, I want to upload a document (PDF, PNG, JPG, JPEG, or WebP) and receive the complete text content so that I can use the extracted text in subsequent workflow steps.

**Why this priority**: This is the core functionality of the node. Without full-text extraction, the node provides no value. It's also the simpler of the two output modes and serves as the foundation for the structured extraction.

**Independent Test**: Can be fully tested by uploading a single document, selecting "text" output format, and verifying that readable text content is returned. Delivers immediate value for any OCR use case.

**Acceptance Scenarios**:

1. **Given** I have configured the Deep-OCR node with valid API credentials and selected "text" as output format, **When** I execute the workflow with a PDF document, **Then** the node returns the full text content of the document as a string
2. **Given** I have configured the Deep-OCR node with valid API credentials, **When** I execute the workflow with a supported image file (PNG, JPG, JPEG, WebP), **Then** the node returns the extracted text content
3. **Given** I have configured the Deep-OCR node, **When** I execute the workflow with an unsupported file format, **Then** the node returns a clear error message indicating supported formats

---

### User Story 2 - Extract Structured Fields from Document (Priority: P2)

As an n8n workflow user, I want to specify which fields should be extracted from a document and receive them in a structured JSON format so that I can directly use specific data points like sender, amount, or date in my workflow without manual parsing.

**Why this priority**: This is the advanced functionality that differentiates the node from simple OCR tools. It enables sophisticated document processing workflows but depends on the foundational API connectivity from User Story 1.

**Independent Test**: Can be fully tested by uploading an invoice document, entering fields like "sender,amount,date", and verifying that a JSON object with these specific fields is returned.

**Acceptance Scenarios**:

1. **Given** I have configured the Deep-OCR node with "structured" output format and specified fields "sender,amount,date", **When** I execute the workflow with an invoice document, **Then** the node returns a JSON object containing the requested fields with their extracted values
2. **Given** I have configured the Deep-OCR node with "structured" output format but left the fields parameter empty, **When** I execute the workflow, **Then** the node either extracts all detectable fields or returns a clear message requesting field specification
3. **Given** I have specified fields that don't exist in the document, **When** I execute the workflow, **Then** the node returns null or empty values for those fields without failing the entire extraction

---

### User Story 3 - Configure API Authentication (Priority: P1)

As an n8n workflow user, I want to securely configure my Deep-OCR API credentials so that my API key is stored safely and reused across multiple workflow executions.

**Why this priority**: Authentication is a prerequisite for any API interaction. Without proper credential management, the node cannot function. This must be implemented alongside User Story 1.

**Independent Test**: Can be tested by creating credentials in n8n, configuring the node to use them, and verifying that API calls include the correct Authorization header.

**Acceptance Scenarios**:

1. **Given** I open the n8n credentials panel, **When** I create new "Deep-OCR API" credentials, **Then** I can enter and save my API key securely
2. **Given** I have saved Deep-OCR credentials, **When** I configure the Deep-OCR node, **Then** I can select my saved credentials from a dropdown
3. **Given** I have configured invalid API credentials, **When** I execute the workflow, **Then** the node returns a clear authentication error message

---

### Edge Cases

- What happens when the uploaded document is empty or corrupted? → Clear error message indicating the document could not be processed
- What happens when the API service is unavailable? → Timeout error with suggestion to retry
- What happens when the document exceeds size limits? → Clear error message with size limit information
- How does the system handle documents with no extractable text (blank pages)? → Returns empty string for text mode or empty object for structured mode
- What happens when the API key is valid but has exceeded rate limits? → Rate limit error with retry-after information

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide an n8n community node that integrates with the Deep-OCR API endpoint `/v1/ocr`
- **FR-002**: System MUST support document upload for PDF, PNG, JPG, JPEG, and WebP file formats
- **FR-003**: System MUST provide an output format selector with options "text" (fulltext) and "structured" (JSON)
- **FR-004**: System MUST accept a comma-separated list of field names when "structured" output format is selected
- **FR-005**: System MUST send API requests with Bearer token authentication using the configured API key
- **FR-006**: System MUST display the fields input parameter only when "structured" output format is selected
- **FR-007**: System MUST return extracted text as a string when "text" output format is selected
- **FR-008**: System MUST return extracted data as a JSON object when "structured" output format is selected
- **FR-009**: System MUST provide descriptive error messages for authentication failures, invalid files, and API errors
- **FR-010**: System MUST implement n8n credential management for secure API key storage

### Key Entities

- **Deep-OCR Credentials**: Stores the API key for authentication; used by the node to authorize requests
- **Document Input**: Binary data from previous workflow nodes or file system; supports multiple image/document formats
- **OCR Result**: Output data containing either full text (string) or structured fields (JSON object)
- **Node Configuration**: User-selected options including output format and optional field list

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete node setup and first successful OCR extraction in under 5 minutes
- **SC-002**: Node provides clear, actionable error messages for all failure scenarios within 2 seconds of error occurrence
- **SC-003**: 95% of valid document uploads return extracted content without errors
- **SC-004**: Node parameters and behavior are consistent with n8n UX conventions (matching other community nodes)
- **SC-005**: OCR operations complete within 30 seconds for standard document sizes (under 10MB)
- **SC-006**: Users can switch between text and structured output formats and immediately see relevant parameter changes

## Assumptions

- The Deep-OCR API endpoint is stable and follows the documented specification
- Users have a valid Deep-OCR API key before using the node
- n8n workflows provide binary data input from previous nodes (file upload, HTTP request, etc.)
- The API returns responses in a consistent JSON format as documented
- Standard API rate limits are reasonable for typical workflow usage patterns

## Out of Scope

- Batch processing of multiple documents in a single node execution
- Document preprocessing (rotation, cropping, enhancement)
- Local OCR processing (all processing via Deep-OCR API)
- API key generation or account management within the node
- Caching of OCR results
