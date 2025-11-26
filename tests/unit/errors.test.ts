import {
  isValidMimeType,
  isValidFileSize,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  DeepOcrErrorCode,
} from '../../src/utils/errors';

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
});
