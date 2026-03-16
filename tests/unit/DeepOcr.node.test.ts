import { DeepOcr } from '../../src/nodes/DeepOcr/DeepOcr.node';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { mockDeep } from 'jest-mock-extended';

describe('DeepOcr Node', () => {
  let node: DeepOcr;

  beforeEach(() => {
    node = new DeepOcr();
  });

  describe('node description', () => {
    it('should have correct display name', () => {
      expect(node.description.displayName).toBe('Deep-OCR');
    });

    it('should have correct internal name', () => {
      expect(node.description.name).toBe('deepOcr');
    });

    it('should have correct icon', () => {
      expect(node.description.icon).toBe('file:deepocr.svg');
    });

    it('should be in transform group', () => {
      expect(node.description.group).toContain('transform');
    });

    it('should have version 1', () => {
      expect(node.description.version).toBe(1);
    });

    it('should have one main input', () => {
      expect(node.description.inputs).toEqual(['main']);
    });

    it('should have one main output', () => {
      expect(node.description.outputs).toEqual(['main']);
    });

    it('should require deepOcrApi credentials', () => {
      const credentialConfig = node.description.credentials?.find(
        (c) => c.name === 'deepOcrApi',
      );
      expect(credentialConfig).toBeDefined();
      expect(credentialConfig?.required).toBe(true);
    });
  });

  describe('node properties', () => {
    it('should have binaryPropertyName parameter', () => {
      const prop = node.description.properties.find((p) => p.name === 'binaryPropertyName');
      expect(prop).toBeDefined();
      expect(prop?.type).toBe('string');
      expect(prop?.default).toBe('data');
      expect(prop?.required).toBe(true);
    });

    it('should have documentType parameter defaulting to invoice', () => {
      const prop = node.description.properties.find((p) => p.name === 'documentType');
      expect(prop).toBeDefined();
      expect(prop?.type).toBe('options');
      expect(prop?.default).toBe('invoice');
    });

    it('should have all 7 document type options', () => {
      const prop = node.description.properties.find((p) => p.name === 'documentType');
      const options = prop?.options as Array<{ value: string }>;
      const values = options?.map((o) => o.value);
      expect(values).toContain('invoice');
      expect(values).toContain('receipt');
      expect(values).toContain('contract');
      expect(values).toContain('id_document');
      expect(values).toContain('delivery_note');
      expect(values).toContain('handwriting');
      expect(values).toContain('generic');
    });
  });

  describe('execute method', () => {
    let mockExecuteFunctions: IExecuteFunctions;

    beforeEach(() => {
      mockExecuteFunctions = mockDeep<IExecuteFunctions>();
    });

    it('should process invoice and return structured content', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];
      const binaryBuffer = Buffer.from('test pdf content');

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('invoice');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'application/pdf',
        fileName: 'invoice.pdf',
      });
      (mockExecuteFunctions.helpers.getBinaryDataBuffer as jest.Mock).mockResolvedValue(binaryBuffer);
      (mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock).mockResolvedValue({
        success: true,
        filename: 'invoice.pdf',
        document_type: 'invoice',
        content: { invoice_number: 'INV-001', total: 119.0 },
        metadata: { pages: 1, processing_time: 2.5 },
      });

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json.invoice_number).toBe('INV-001');
      expect(result[0][0].json.total).toBe(119.0);
      expect(result[0][0].json.document_type).toBe('invoice');
      expect(result[0][0].json.filename).toBe('invoice.pdf');
    });

    it('should send document_type as query param to /v1/ocr', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];
      const binaryBuffer = Buffer.from('test pdf content');

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('receipt');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'image/png',
        fileName: 'receipt.png',
      });
      (mockExecuteFunctions.helpers.getBinaryDataBuffer as jest.Mock).mockResolvedValue(binaryBuffer);
      (mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock).mockResolvedValue({
        success: true,
        filename: 'receipt.png',
        document_type: 'receipt',
        content: { merchant: 'Supermarket', total: 42.5 },
        metadata: { pages: 1 },
      });

      await node.execute.call(mockExecuteFunctions);

      expect(mockExecuteFunctions.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'deepOcrApi',
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.deep-ocr.com/v1/ocr',
          qs: { document_type: 'receipt' },
        }),
      );
    });

    it('should validate file type', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('invoice');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'text/plain',
        fileName: 'test.txt',
      });
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
      (mockExecuteFunctions.getNode as jest.Mock).mockReturnValue({ name: 'Deep-OCR' });

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Unsupported file type');
    });

    it('should validate file size (max 10MB)', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('invoice');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'application/pdf',
        fileName: 'large.pdf',
      });
      (mockExecuteFunctions.helpers.getBinaryDataBuffer as jest.Mock).mockResolvedValue(largeBuffer);
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
      (mockExecuteFunctions.getNode as jest.Mock).mockReturnValue({ name: 'Deep-OCR' });

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('exceeds maximum allowed size');
    });

    it('should handle continueOnFail gracefully', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('invoice');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'text/plain',
        fileName: 'test.txt',
      });
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
      (mockExecuteFunctions.getNode as jest.Mock).mockReturnValue({ name: 'Deep-OCR' });

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result[0][0].json.error).toBeDefined();
    });
  });
});
