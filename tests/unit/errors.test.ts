import {
  isValidMimeType,
  isValidFileSize,
  createFileTypeError,
  createFileSizeError,
  createApiError,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  DeepOcrErrorCode,
} from '../../src/utils/errors';
import type { INode } from 'n8n-workflow';

// Mock node for testing error creation functions
const mockNode: INode = {
  id: 'test-node-id',
  name: 'Deep-OCR',
  type: 'n8n-nodes-deep-ocr.deepOcr',
  typeVersion: 1,
  position: [0, 0],
  parameters: {},
};

describe('Error Utilities', () => {
  describe('constants', () => {
    it('should have MAX_FILE_SIZE as 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should have correct allowed MIME types', () => {
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/jpg');
      expect(ALLOWED_MIME_TYPES).toContain('image/webp');
    });

    it('should have correct error codes', () => {
      expect(DeepOcrErrorCode.INVALID_FILE_TYPE).toBe('INVALID_FILE_TYPE');
      expect(DeepOcrErrorCode.FILE_TOO_LARGE).toBe('FILE_TOO_LARGE');
      expect(DeepOcrErrorCode.MISSING_BINARY_DATA).toBe('MISSING_BINARY_DATA');
      expect(DeepOcrErrorCode.API_ERROR).toBe('API_ERROR');
      expect(DeepOcrErrorCode.AUTH_ERROR).toBe('AUTH_ERROR');
    });
  });

  describe('isValidMimeType', () => {
    it('should return true for valid MIME types', () => {
      expect(isValidMimeType('application/pdf')).toBe(true);
      expect(isValidMimeType('image/png')).toBe(true);
      expect(isValidMimeType('image/jpeg')).toBe(true);
      expect(isValidMimeType('image/jpg')).toBe(true);
      expect(isValidMimeType('image/webp')).toBe(true);
    });

    it('should return false for invalid MIME types', () => {
      expect(isValidMimeType('text/plain')).toBe(false);
      expect(isValidMimeType('application/json')).toBe(false);
      expect(isValidMimeType('image/gif')).toBe(false);
    });

    it('should return true for undefined MIME type', () => {
      expect(isValidMimeType(undefined)).toBe(true);
    });

    it('should return true for empty string MIME type', () => {
      expect(isValidMimeType('')).toBe(true);
    });
  });

  describe('isValidFileSize', () => {
    it('should return true for files within limit', () => {
      expect(isValidFileSize(1024)).toBe(true);
      expect(isValidFileSize(5 * 1024 * 1024)).toBe(true);
      expect(isValidFileSize(MAX_FILE_SIZE)).toBe(true);
    });

    it('should return false for files exceeding limit', () => {
      expect(isValidFileSize(MAX_FILE_SIZE + 1)).toBe(false);
      expect(isValidFileSize(11 * 1024 * 1024)).toBe(false);
    });
  });

  describe('createFileTypeError', () => {
    it('should create error with correct message', () => {
      const error = createFileTypeError(mockNode, 'text/plain', 0);
      expect(error.message).toContain('Unsupported file type: text/plain');
    });

    it('should include itemIndex in error context', () => {
      const error = createFileTypeError(mockNode, 'application/json', 5);
      expect(error.context).toBeDefined();
      expect(error.context?.itemIndex).toBe(5);
    });

    it('should include description about supported types', () => {
      const error = createFileTypeError(mockNode, 'image/gif', 0);
      expect(error.description).toContain('not supported');
    });
  });

  describe('createFileSizeError', () => {
    it('should create error with correct message', () => {
      const error = createFileSizeError(mockNode, 15 * 1024 * 1024, 0);
      expect(error.message).toContain('exceeds maximum allowed size of 10MB');
    });

    it('should include file size in MB in message', () => {
      const error = createFileSizeError(mockNode, 15 * 1024 * 1024, 0);
      expect(error.message).toContain('15MB');
    });

    it('should include itemIndex in error context', () => {
      const error = createFileSizeError(mockNode, 11 * 1024 * 1024, 3);
      expect(error.context).toBeDefined();
      expect(error.context?.itemIndex).toBe(3);
    });
  });

  describe('createApiError', () => {
    it('should create error with correct message', () => {
      const originalError = new Error('API timeout');
      const error = createApiError(mockNode, originalError, 0);
      expect(error.message).toContain('Failed to process document with Deep-OCR API');
    });

    it('should include itemIndex in error context', () => {
      const originalError = { message: 'Connection refused' };
      const error = createApiError(mockNode, originalError, 2);
      expect(error.context).toBeDefined();
      expect(error.context?.itemIndex).toBe(2);
    });
  });
});
