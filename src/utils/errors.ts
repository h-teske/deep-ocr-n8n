import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import type { INode, JsonObject } from 'n8n-workflow';

/**
 * Error codes for Deep-OCR operations
 */
export enum DeepOcrErrorCode {
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  MISSING_BINARY_DATA = 'MISSING_BINARY_DATA',
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
}

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed MIME types for document processing
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

/**
 * Creates a NodeOperationError for invalid file types
 */
export function createFileTypeError(
  node: INode,
  mimeType: string,
  itemIndex?: number,
): NodeOperationError {
  return new NodeOperationError(
    node,
    `Unsupported file type: ${mimeType}. Supported types: PDF, PNG, JPG, JPEG, WebP`,
    {
      itemIndex,
      description: `The file has MIME type "${mimeType}" which is not supported by the Deep-OCR API.`,
    },
  );
}

/**
 * Creates a NodeOperationError for files exceeding size limit
 */
export function createFileSizeError(
  node: INode,
  sizeBytes: number,
  itemIndex?: number,
): NodeOperationError {
  const sizeMB = Math.round(sizeBytes / 1024 / 1024);
  return new NodeOperationError(
    node,
    `File size (${sizeMB}MB) exceeds maximum allowed size of 10MB`,
    {
      itemIndex,
      description: 'Please reduce the file size or use a smaller document.',
    },
  );
}

/**
 * Creates a NodeApiError for API failures
 */
export function createApiError(
  node: INode,
  error: Error | JsonObject,
  itemIndex?: number,
): NodeApiError {
  return new NodeApiError(node, error as JsonObject, {
    message: 'Failed to process document with Deep-OCR API',
    itemIndex,
  });
}

/**
 * Validates MIME type against allowed types
 */
export function isValidMimeType(mimeType: string | undefined): boolean {
  if (mimeType === undefined || mimeType === null || mimeType === '') {
    return true; // Allow undefined/empty, will be handled by API
  }
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Validates file size against maximum limit
 */
export function isValidFileSize(sizeBytes: number): boolean {
  return sizeBytes <= MAX_FILE_SIZE;
}
