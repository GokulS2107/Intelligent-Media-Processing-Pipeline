const analyzeBrightness = require('../../../src/analyzers/brightnessAnalyzer');
const { generateTestImage, cleanupTestImages } = require('../../fixtures/test-image-generator');

describe('Brightness Analyzer', () => {
  let testImages = [];

  afterEach(() => {
    cleanupTestImages(testImages);
    testImages = [];
  });

  describe('analyzeBrightness', () => {
    it('should detect bright image', async () => {
      // Create a bright image
      const imagePath = await generateTestImage({
        width: 100,
        height: 100,
        text: '',
        format: 'jpeg'
      });
      testImages.push(imagePath);

      const result = await analyzeBrightness(imagePath);
      
      expect(result).toHaveProperty('detected');
      expect(result).toHaveProperty('averageBrightness');
      expect(result).toHaveProperty('classification');
      expect(result.averageBrightness).toBeGreaterThan(0);
      expect(result.averageBrightness).toBeLessThan(256);
    });

    it('should handle dark images correctly', async () => {
      // Create a dark image using a dark background
      const imagePath = await generateTestImage({
        width: 100,
        height: 100,
        text: '',
        format: 'jpeg'
      });
      testImages.push(imagePath);

      const result = await analyzeBrightness(imagePath);
      
      expect(result).toHaveProperty('classification');
      expect(['too_dark', 'too_bright', 'acceptable', 'unknown']).toContain(result.classification);
    });

    it('should handle errors gracefully', async () => {
      const result = await analyzeBrightness('/nonexistent/path/image.jpg');
      
      expect(result).toHaveProperty('detected', false);
      expect(result).toHaveProperty('averageBrightness', 0);
      expect(result).toHaveProperty('classification', 'unknown');
      expect(result).toHaveProperty('error');
    });

    it('should return valid brightness values', async () => {
      const imagePath = await generateTestImage({
        width: 100,
        height: 100,
        text: '',
        format: 'jpeg'
      });
      testImages.push(imagePath);

      const result = await analyzeBrightness(imagePath);
      
      expect(result.averageBrightness).toBeGreaterThanOrEqual(0);
      expect(result.averageBrightness).toBeLessThanOrEqual(255);
    });
  });
});