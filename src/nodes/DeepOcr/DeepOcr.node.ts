import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import {
  isValidMimeType,
  isValidFileSize,
  createFileTypeError,
  createFileSizeError,
} from '../../utils/errors';

/**
 * Response structure from the Deep-OCR API
 * { success, filename, document_type, content, metadata }
 */
interface OcrApiResponse {
  success?: boolean;
  filename?: string;
  document_type?: string;
  content?: IDataObject;
  metadata?: IDataObject;
  [key: string]: unknown;
}

/**
 * Deep-OCR Node
 *
 * Extract structured data from documents using the Deep-OCR API.
 * Supports PDF, PNG, JPG, JPEG, and WebP formats up to 10MB.
 */
export class DeepOcr implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Deep-OCR',
    name: 'deepOcr',
    icon: 'file:deepocr.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["documentType"]}}',
    description: 'Extract structured data from documents using Deep-OCR API',
    defaults: {
      name: 'Deep-OCR',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'deepOcrApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        default: 'data',
        required: true,
        description: 'Name of the binary property containing the document to process',
      },
      {
        displayName: 'Document Type',
        name: 'documentType',
        type: 'options',
        options: [
          {
            name: 'Contract',
            value: 'contract',
            description: 'Extract parties, terms, and obligations from contracts',
          },
          {
            name: 'Delivery Note',
            value: 'delivery_note',
            description: 'Extract items, quantities, and delivery info from delivery notes',
          },
          {
            name: 'Generic',
            value: 'generic',
            description: 'Extract all detectable content from any document',
          },
          {
            name: 'Handwriting',
            value: 'handwriting',
            description: 'Transcribe handwritten text',
          },
          {
            name: 'ID Document',
            value: 'id_document',
            description: 'Extract personal data from passports and ID cards',
          },
          {
            name: 'Invoice',
            value: 'invoice',
            description: 'Extract vendor, line items, totals, and payment terms from invoices',
          },
          {
            name: 'Receipt',
            value: 'receipt',
            description: 'Extract merchant, items, and totals from receipts',
          },
        ],
        default: 'invoice',
        description: 'Type of document — determines the extraction schema',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data');
        const documentType = this.getNodeParameter('documentType', itemIndex, 'invoice');

        // Get binary data
        const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);

        // Validate MIME type
        if (!isValidMimeType(binaryData.mimeType)) {
          throw createFileTypeError(this.getNode(), binaryData.mimeType ?? 'unknown', itemIndex);
        }

        // Get binary buffer
        const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

        // Validate file size
        if (!isValidFileSize(buffer.length)) {
          throw createFileSizeError(this.getNode(), buffer.length, itemIndex);
        }

        // Make API request — document_type as query param, file as multipart
        // requestWithAuthentication (request-library) is used because httpRequestWithAuthentication
        // (IHttpRequestOptions) does not support the formData property for multipart uploads.
        const response = (await this.helpers.requestWithAuthentication.call(
          this,
          'deepOcrApi',
          {
            method: 'POST',
            url: 'https://api.deep-ocr.com/v1/ocr',
            qs: { document_type: documentType },
            formData: {
              file: {
                value: buffer,
                options: {
                  filename: binaryData.fileName ?? 'document',
                  contentType: binaryData.mimeType ?? 'application/octet-stream',
                },
              },
            },
            json: true,
          },
        )) as OcrApiResponse;

        // API always returns structured JSON in response.content
        const content: IDataObject = (response.content as IDataObject) ?? {};
        returnData.push({
          json: {
            ...content,
            filename: response.filename,
            document_type: response.document_type,
            metadata: response.metadata,
          },
          pairedItem: { item: itemIndex },
        });
      } catch (error: unknown) {
        if (this.continueOnFail()) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          returnData.push({
            json: { error: errorMessage },
            pairedItem: { item: itemIndex },
          });
          continue;
        }
        if (error instanceof NodeApiError || error instanceof NodeOperationError) {
          throw error;
        }
        const errorObject: JsonObject = {
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        throw new NodeApiError(this.getNode(), errorObject, {
          message: 'Failed to process document with Deep-OCR API',
          itemIndex,
        });
      }
    }

    return [returnData];
  }
}
