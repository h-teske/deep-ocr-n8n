# n8n-nodes-deep-ocr

N8N Community Node for the [Deep-OCR Service](https://deep-ocr.com) - Extract structured data from documents using AI-powered OCR.

[![npm version](https://badge.fury.io/js/n8n-nodes-deep-ocr.svg)](https://www.npmjs.com/package/n8n-nodes-deep-ocr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Structured Data Extraction**: Receive a typed JSON object with the fields relevant to the document type
- **7 Document Types**: Invoice, Receipt, Contract, Delivery Note, ID Document, Handwriting, Generic
- **Multiple Format Support**: PDF, PNG, JPG, JPEG, WebP (up to 10MB)
- **Secure Authentication**: API key stored securely using n8n credentials

## 📦 Installation

### Community Nodes (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-deep-ocr`
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-deep-ocr
```

## 🔧 Configuration

### Setting Up Credentials

1. Get your API key from [Deep-OCR Dashboard](https://deep-ocr.com)
2. In n8n, go to **Credentials** → **Add Credential**
3. Search for "Deep-OCR API"
4. Enter your API key and save

## 📖 Usage

1. Add the **Deep-OCR** node to your workflow
2. Connect a node that provides binary data (e.g., Read Binary File, HTTP Request)
3. Configure:
   - **Binary Property**: Name of the binary property containing your document (default: `data`)
   - **Document Type**: Select the type that matches your document
4. Execute — the node outputs a JSON object with the extracted fields

### Document Types

| Type | Description |
|---|---|
| `invoice` | Vendor, line items, totals, payment terms |
| `receipt` | Merchant, items purchased, totals, payment method |
| `contract` | Parties, dates, key clauses |
| `delivery_note` | Sender, recipient, items, quantities |
| `id_document` | Name, date of birth, document number, expiry |
| `handwriting` | Transcription of handwritten text |
| `generic` | General extraction for any document type |

## 📋 Example Workflow

```json
{
  "nodes": [
    {
      "name": "Read Invoice PDF",
      "type": "n8n-nodes-base.readBinaryFile",
      "parameters": {
        "filePath": "/path/to/invoice.pdf"
      }
    },
    {
      "name": "Extract Invoice Data",
      "type": "n8n-nodes-deep-ocr.deepOcr",
      "parameters": {
        "binaryPropertyName": "data",
        "documentType": "invoice"
      }
    }
  ]
}
```

## 🔒 Supported File Types

| Format   | MIME Type       | Max Size |
| -------- | --------------- | -------- |
| PDF      | application/pdf | 10MB     |
| PNG      | image/png       | 10MB     |
| JPG/JPEG | image/jpeg      | 10MB     |
| WebP     | image/webp      | 10MB     |

## 🛠️ Development

### Prerequisites

- Node.js 22+
- pnpm 9.1+

### Setup

```bash
# Clone the repository
git clone https://github.com/Heey-Global/deep-ocr-n8n.git
cd deep-ocr-n8n

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint
```

### Project Structure

```
src/
├── credentials/
│   └── DeepOcrApi.credentials.ts    # API key credential type
├── nodes/
│   └── DeepOcr/
│       ├── DeepOcr.node.ts          # Main node implementation
│       └── deepocr.svg              # Node icon
├── utils/
│   └── errors.ts                    # Error handling utilities
└── index.ts                         # Package entry point
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please submit pull requests to our [repository](https://github.com/Heey-Global/deep-ocr-n8n).

## 📞 Support

- [GitHub Issues](https://github.com/Heey-Global/deep-ocr-n8n/issues)
- [Deep-OCR Documentation](https://deep-ocr.com)
