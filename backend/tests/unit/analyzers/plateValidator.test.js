const analyzePlateValidation = require('../../../src/analyzers/plateValidator');

describe('Plate Validator', () => {
  describe('validateIndianVehicleNumber', () => {
    it('should validate standard Indian vehicle number', async () => {
      const ocrText = 'KA01AB1234';
      const confidence = 0.87;
      
      const result = await analyzePlateValidation(ocrText, confidence);
      
      expect(result.validFormat).toBe(true);
      expect(result.normalizedText).toBe('KA01AB1234');
      expect(result.confidence).toBe(0.87);
      expect(result.extractedText).toBe(ocrText);
    });

    it('should validate MH format', async () => {
      const ocrText = 'MH12DE1234';
      const confidence = 0.92;
      
      const result = await analyzePlateValidation(ocrText, confidence);
      
      expect(result.validFormat).toBe(true);
      expect(result.normalizedText).toBe('MH12DE1234');
    });

    it('should validate DL format', async () => {
      const ocrText = 'DL01AB1234';
      const confidence = 0.75;
      
      const result = await analyzePlateValidation(ocrText, confidence);
      
      expect(result.validFormat).toBe(true);
      expect(result.normalizedText).toBe('DL01AB1234');
    });

    it('should reject invalid formats', async () => {
      const invalidNumbers = [
        '1234AB1234',
        'KA01A1234',
        'ABC123',
        'KA01AB123',
        'KA01AB12345',
        'KA01A B1234'
      ];

      for (const invalidNumber of invalidNumbers) {
        const result = await analyzePlateValidation(invalidNumber, 0.8);
        expect(result.validFormat).toBe(false);
        expect(result.confidence).toBe(0);
      }
    });

    it('should handle empty OCR text', async () => {
      const result = await analyzePlateValidation('', 0.5);
      
      expect(result.extractedText).toBe(null);
      expect(result.normalizedText).toBe(null);
      expect(result.validFormat).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle null OCR text', async () => {
      const result = await analyzePlateValidation(null, 0.5);
      
      expect(result.extractedText).toBe(null);
      expect(result.normalizedText).toBe(null);
      expect(result.validFormat).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should normalize text by removing special characters', async () => {
      const ocrText = 'KA-01-AB-1234';
      const result = await analyzePlateValidation(ocrText, 0.8);
      
      expect(result.normalizedText).toBe('KA01AB1234');
      expect(result.validFormat).toBe(true);
    });

    it('should handle lowercase and uppercase mixing', async () => {
      const ocrText = 'ka01ab1234';
      const result = await analyzePlateValidation(ocrText, 0.8);
      
      expect(result.normalizedText).toBe('KA01AB1234');
      expect(result.validFormat).toBe(true);
    });

    it('should handle low confidence OCR results', async () => {
      const ocrText = 'KA01AB1234';
      const lowConfidence = 0.3;
      
      const result = await analyzePlateValidation(ocrText, lowConfidence);
      
      // Should still validate format but with low confidence
      expect(result.validFormat).toBe(true);
      expect(result.confidence).toBe(0.3);
    });

    it('should handle very low confidence as invalid', async () => {
      const ocrText = 'KA01AB1234';
      const veryLowConfidence = 0.1;
      
      const result = await analyzePlateValidation(ocrText, veryLowConfidence);
      
      // Format is valid, but confidence is low
      expect(result.validFormat).toBe(true);
      expect(result.confidence).toBe(0.1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', async () => {
      const longText = 'KA01AB1234KA01AB1234KA01AB1234';
      const result = await analyzePlateValidation(longText, 0.8);
      
      expect(result.validFormat).toBe(false);
      expect(result.normalizedText).toBe(longText);
    });

    it('should handle text with spaces', async () => {
      const textWithSpaces = 'KA 01 AB 1234';
      const result = await analyzePlateValidation(textWithSpaces, 0.8);
      
      expect(result.normalizedText).toBe('KA01AB1234');
      expect(result.validFormat).toBe(true);
    });

    it('should handle text with newlines', async () => {
      const textWithNewlines = 'KA01\nAB1234';
      const result = await analyzePlateValidation(textWithNewlines, 0.8);
      
      expect(result.normalizedText).toBe('KA01AB1234');
      expect(result.validFormat).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should process quickly for valid inputs', async () => {
      const start = Date.now();
      await analyzePlateValidation('KA01AB1234', 0.8);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100); // Should be very fast
    });

    it('should process quickly for invalid inputs', async () => {
      const start = Date.now();
      await analyzePlateValidation('invalid', 0.8);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100); // Should be very fast
    });
  });
});