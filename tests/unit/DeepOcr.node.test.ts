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

    it('should have outputFormat parameter', () => {
      const prop = node.description.properties.find((p) => p.name === 'outputFormat');
      expect(prop).toBeDefined();
      expect(prop?.type).toBe('options');
      expect(prop?.default).toBe('text');
    });

    it('should have text and structured options for outputFormat', () => {
      const prop = node.description.properties.find((p) => p.name === 'outputFormat');
      const options = prop?.options as Array<{ value: string }>;
      expect(options?.map((o) => o.value)).toContain('text');
      expect(options?.map((o) => o.value)).toContain('structured');
    });

    it('should have fields parameter', () => {
      const prop = node.description.properties.find((p) => p.name === 'fields');
      expect(prop).toBeDefined();
      expect(prop?.type).toBe('string');
    });

    it('should show fields only in structured mode', () => {
      const prop = node.description.properties.find((p) => p.name === 'fields');
      expect(prop?.displayOptions?.show?.outputFormat).toContain('structured');
    });
  });

  describe('execute method', () => {
    let mockExecuteFunctions: IExecuteFunctions;

    beforeEach(() => {
      mockExecuteFunctions = mockDeep<IExecuteFunctions>();
    });

    it('should process items and return results', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];
      const binaryBuffer = Buffer.from('test pdf content');

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data') // binaryPropertyName
        .mockReturnValueOnce('text'); // outputFormat
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'application/pdf',
        fileName: 'test.pdf',
      });
      (mockExecuteFunctions.helpers.getBinaryDataBuffer as jest.Mock).mockResolvedValue(
        binaryBuffer,
      );
      (mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock).mockResolvedValue({
        text: 'Extracted text content',
      });

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result).toBeDefined();
      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json.text).toBe('Extracted text content');
    });

    it('should validate file type', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('text');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'text/plain',
        fileName: 'test.txt',
      });
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
      (mockExecuteFunctions.getNode as jest.Mock).mockReturnValue({ name: 'Deep-OCR' });

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'Unsupported file type',
      );
    });

    it('should validate file size (max 10MB)', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('text');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'application/pdf',
        fileName: 'large.pdf',
      });
      (mockExecuteFunctions.helpers.getBinaryDataBuffer as jest.Mock).mockResolvedValue(
        largeBuffer,
      );
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
      (mockExecuteFunctions.getNode as jest.Mock).mockReturnValue({ name: 'Deep-OCR' });

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'exceeds maximum allowed size',
      );
    });

    it('should handle continueOnFail gracefully', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data')
        .mockReturnValueOnce('text');
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'text/plain',
        fileName: 'test.txt',
      });
      (mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
      (mockExecuteFunctions.getNode as jest.Mock).mockReturnValue({ name: 'Deep-OCR' });

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result[0][0].json.error).toBeDefined();
    });

    it('should include fields parameter in structured mode', async () => {
      const inputItems: INodeExecutionData[] = [{ json: {} }];
      const binaryBuffer = Buffer.from('test pdf content');

      (mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue(inputItems);
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('data') // binaryPropertyName
        .mockReturnValueOnce('structured') // outputFormat
        .mockReturnValueOnce('sender, amount, date'); // fields
      (mockExecuteFunctions.helpers.assertBinaryData as jest.Mock).mockReturnValue({
        mimeType: 'application/pdf',
        fileName: 'invoice.pdf',
      });
      (mockExecuteFunctions.helpers.getBinaryDataBuffer as jest.Mock).mockResolvedValue(
        binaryBuffer,
      );
      (mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock).mockResolvedValue({
        fields: { sender: 'Company A', amount: '100.00', date: '2025-01-01' },
      });

      const result = await node.execute.call(mockExecuteFunctions);

      expect(
        mockExecuteFunctions.helpers.httpRequestWithAuthentication,
      ).toHaveBeenCalledWith(
        'deepOcrApi',
        expect.objectContaining({
          body: expect.objectContaining({
            fields: 'sender, amount, date',
          }),
        }),
      );
      expect(result[0][0].json).toEqual({
        sender: 'Company A',
        amount: '100.00',
        date: '2025-01-01',
      });
    });
  });
});
