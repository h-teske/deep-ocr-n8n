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
 */
interface OcrApiResponse {
  text?: string;
  content?: string;
  fields?: IDataObject;
  data?: IDataObject;
  [key: string]: unknown;
}

/**
 * Deep-OCR Node
 *
 * Extract text and structured data from documents using the Deep-OCR API.
 * Supports PDF, PNG, JPG, JPEG, and WebP formats up to 10MB.
 */
export class DeepOcr implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Deep-OCR',
    name: 'deepOcr',
    icon: 'file:deepocr.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["outputFormat"]}}',
    description: 'Extract text and structured data from documents using Deep-OCR API',
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
        displayName: 'Output Format',
        name: 'outputFormat',
        type: 'options',
        options: [
          {
            name: 'Text',
            value: 'text',
            description: 'Extract full text content from the document',
          },
          {
            name: 'Structured',
            value: 'structured',
            description: 'Extract specific fields as JSON object',
          },
        ],
        default: 'text',
        description: 'How to format the extracted data',
      },
      {
        displayName: 'Fields',
        name: 'fields',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            outputFormat: ['structured'],
          },
        },
        placeholder: 'sender, amount, date',
        description:
          'Comma-separated list of fields to extract. Leave empty to auto-detect all fields.',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data');
        const outputFormat = this.getNodeParameter('outputFormat', itemIndex, 'text');

        // Get binary data
        const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);

        // Validate MIME type using utility function
        if (!isValidMimeType(binaryData.mimeType)) {
          throw createFileTypeError(this.getNode(), binaryData.mimeType ?? 'unknown', itemIndex);
        }

        // Get binary buffer
        const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

        // Validate file size using utility function
        if (!isValidFileSize(buffer.length)) {
          throw createFileSizeError(this.getNode(), buffer.length, itemIndex);
        }

        // Build API request
        const formData: Record<string, unknown> = {
          file: {
            value: buffer,
            options: {
              filename: binaryData.fileName ?? 'document',
              contentType: binaryData.mimeType ?? 'application/octet-stream',
            },
          },
          output_format: outputFormat,
        };

        // Add fields parameter for structured mode
        if (outputFormat === 'structured') {
          const fields = this.getNodeParameter('fields', itemIndex, '') as string;
          const trimmedFields = fields.trim();
          if (trimmedFields.length > 0) {
            formData.fields = trimmedFields;
          }
        }

        // Make API request
        const response = (await this.helpers.httpRequestWithAuthentication.call(
          this,
          'deepOcrApi',
          {
            method: 'POST',
            url: 'https://api.deep-ocr.com/v1/ocr',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            json: true,
          },
        )) as OcrApiResponse;

        // Transform response based on output format
        if (outputFormat === 'text') {
          const textContent = response.text ?? response.content ?? '';
          returnData.push({
            json: {
              text: textContent,
            },
            pairedItem: { item: itemIndex },
          });
        } else {
          // Structured format - return the extracted fields
          const structuredData: IDataObject = response.fields ?? response.data ?? (response as IDataObject);
          returnData.push({
            json: structuredData,
            pairedItem: { item: itemIndex },
          });
        }
      } catch (error: unknown) {
        if (this.continueOnFail()) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          returnData.push({
            json: {
              error: errorMessage,
            },
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
