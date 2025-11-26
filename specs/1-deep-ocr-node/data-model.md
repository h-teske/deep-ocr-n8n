# Data Model: Deep-OCR n8n Community Node

**Feature Branch**: `1-deep-ocr-node`  
**Created**: 2025-11-26  
**Source**: [spec.md](./spec.md) Key Entities section

## Entities

### 1. DeepOcrCredentials

**Purpose**: Stores API authentication credentials for Deep-OCR service

| Field  | Type   | Required | Description                         |
| ------ | ------ | -------- | ----------------------------------- |
| apiKey | string | Yes      | Bearer token for API authentication |

**Validation Rules**:

- apiKey must be non-empty string
- apiKey stored securely (n8n handles encryption)
- Credential test via `POST /v1/ocr` endpoint (requires valid auth header to return 401 vs 200/422)

**State Transitions**: N/A (static credential)

---

### 2. NodeConfiguration

**Purpose**: User-selected options for OCR processing

| Field              | Type   | Required    | Default | Description                                                       |
| ------------------ | ------ | ----------- | ------- | ----------------------------------------------------------------- |
| binaryPropertyName | string | Yes         | 'data'  | Name of input binary property containing document                 |
| outputFormat       | enum   | Yes         | 'text'  | Output mode: 'text' or 'structured'                               |
| fields             | string | Conditional | ''      | Comma-separated field names (only when outputFormat='structured') |

**Note**: API base URL is hardcoded to `https://api.deep-ocr.com` (no user configuration needed).

**Validation Rules**:

- binaryPropertyName must reference existing binary property in input
- outputFormat must be 'text' or 'structured'
- fields is only validated when outputFormat='structured'
- fields should be comma-separated alphanumeric values

**Conditional Logic**:

- `fields` parameter visible only when `outputFormat === 'structured'`

---

### 3. DocumentInput

**Purpose**: Binary document data from n8n workflow input

| Field    | Type   | Required | Description                                                    |
| -------- | ------ | -------- | -------------------------------------------------------------- |
| data     | Buffer | Yes      | Raw binary content of document                                 |
| mimeType | string | Yes      | MIME type (application/pdf, image/png, image/jpeg, image/webp) |
| fileName | string | No       | Original filename (used for API request)                       |
| fileSize | number | No       | Size in bytes (for validation)                                 |

**Validation Rules**:

- mimeType must be one of: application/pdf, image/png, image/jpeg, image/webp
- Maximum file size: 10MB (API constraint)
- data must be non-empty buffer

**Supported Formats**:
| Extension | MIME Type |
|-----------|-----------|
| .pdf | application/pdf |
| .png | image/png |
| .jpg, .jpeg | image/jpeg |
| .webp | image/webp |

---

### 4. OcrResult

**Purpose**: Output data from OCR processing

#### Text Mode Output

| Field | Type   | Description                 |
| ----- | ------ | --------------------------- |
| text  | string | Full extracted text content |

#### Structured Mode Output

| Field       | Type   | Description                             |
| ----------- | ------ | --------------------------------------- |
| [fieldName] | string | Dynamic field based on requested fields |
| ...         | ...    | Additional requested fields             |

**Example Outputs**:

Text mode:

```json
{
  "text": "Invoice #12345\nDate: 2025-01-15\nAmount: $1,234.56\nFrom: Acme Corp..."
}
```

Structured mode (fields: "sender,amount,date"):

```json
{
  "sender": "Acme Corp",
  "amount": "$1,234.56",
  "date": "2025-01-15"
}
```

---

### 5. ApiError

**Purpose**: Error response structure from Deep-OCR API

| Field         | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| detail        | array  | Validation error details       |
| detail[].loc  | array  | Location of error (field path) |
| detail[].msg  | string | Human-readable error message   |
| detail[].type | string | Error type identifier          |

**Example**:

```json
{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Error Mapping**:
| HTTP Status | n8n Error Type | User Message |
|-------------|----------------|--------------|
| 401 | NodeApiError | Authentication failed. Check your API key. |
| 422 | NodeApiError | Invalid request: {detail.msg} |
| 429 | NodeApiError | Rate limit exceeded. Try again later. |
| 500 | NodeApiError | OCR service error. Please try again. |
| timeout | NodeApiError | Request timed out. Document may be too large. |

## Data Flow

```
┌─────────────────────┐
│  Previous Node      │
│  (Binary Output)    │
└─────────┬───────────┘
          │
          ▼ DocumentInput (binary data)
┌─────────────────────┐
│  Deep-OCR Node      │
│                     │
│  NodeConfiguration: │
│  - outputFormat     │
│  - fields           │
│  - binaryProperty   │
└─────────┬───────────┘
          │
          ▼ API Request (multipart/form-data)
┌─────────────────────┐
│  Deep-OCR API       │
│  /v1/ocr            │
│                     │
│  DeepOcrCredentials │
│  (Bearer token)     │
└─────────┬───────────┘
          │
          ▼ OcrResult (JSON)
┌─────────────────────┐
│  Next Node          │
│  (JSON Input)       │
└─────────────────────┘
```

## Relationships

```
DeepOcrCredentials 1 ──── * NodeExecution
NodeConfiguration  1 ──── 1 NodeExecution
DocumentInput      * ──── 1 NodeExecution (items array)
OcrResult          * ──── 1 NodeExecution (return items)
```

## n8n Type Mappings

| Entity             | n8n Type           | Interface                              |
| ------------------ | ------------------ | -------------------------------------- |
| DeepOcrCredentials | ICredentialType    | DeepOcrApi.credentials.ts              |
| NodeConfiguration  | INodeProperties[]  | DeepOcr.node.ts description.properties |
| DocumentInput      | IBinaryData        | this.helpers.assertBinaryData()        |
| OcrResult          | INodeExecutionData | return [returnData]                    |
| ApiError           | NodeApiError       | throw new NodeApiError()               |
