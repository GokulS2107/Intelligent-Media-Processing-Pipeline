const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Generate a test image with optional text
 * @param {Object} options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {string} options.text - Text to overlay on image
 * @param {string} options.format - Output format (jpeg, png, webp)
 * @param {string} options.outputPath - Output file path
 * @returns {Promise<string>} Path to generated image
 */
const generateTestImage = async (options = {}) => {
  const {
    width = 800,
    height = 600,
    text = 'Test Image',
    format = 'jpeg',
    outputPath = null
  } = options;

  // Create output path if not provided
  const finalOutputPath = outputPath || path.join(
    __dirname,
    `test-image-${Date.now()}.${format}`
  );

  // Create a simple image with a gradient or text
  const image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  });

  // Add text overlay using SVG (if text is provided)
  if (text) {
    const svg = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="white" />
        <text 
          x="${width/2}" 
          y="${height/2}" 
          font-family="Arial" 
          font-size="${Math.min(width, height) / 10}" 
          fill="black" 
          text-anchor="middle" 
          dominant-baseline="central"
        >${text}</text>
      </svg>
    `;
    
    // Composite the SVG overlay
    const overlay = await sharp(Buffer.from(svg)).toBuffer();
    await sharp(image)
      .composite([{ input: overlay }])
      .toFormat(format)
      .toFile(finalOutputPath);
  } else {
    // Simple colored image with gradient
    const gradient = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 200, b: 150 }
      }
    })
    .toFormat(format)
    .toFile(finalOutputPath);
  }

  return finalOutputPath;
};

/**
 * Generate a test image with a vehicle number plate
 * @param {Object} options
 * @param {string} options.numberPlate - Vehicle number
 * @param {string} options.outputPath - Output file path
 * @returns {Promise<string>} Path to generated image
 */
const generateVehiclePlateImage = async (options = {}) => {
  const {
    numberPlate = 'KA01AB1234',
    outputPath = null
  } = options;

  const finalOutputPath = outputPath || path.join(
    __dirname,
    `vehicle-${Date.now()}.jpg`
  );

  // Create a realistic-looking number plate
  const width = 400;
  const height = 150;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="10" ry="10" fill="#FFD700" stroke="#000" stroke-width="3" />
      <rect x="10" y="10" width="${width-20}" height="${height-20}" rx="5" ry="5" fill="#FFD700" stroke="#000" stroke-width="1" />
      <text 
        x="${width/2}" 
        y="${height/2}" 
        font-family="Arial" 
        font-size="60" 
        font-weight="bold" 
        fill="#000" 
        text-anchor="middle" 
        dominant-baseline="central"
        letter-spacing="5"
      >${numberPlate}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(finalOutputPath);

  return finalOutputPath;
};

/**
 * Clean up generated test images
 * @param {Array<string>} paths - Array of file paths to delete
 */
const cleanupTestImages = (paths) => {
  for (const filePath of paths) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete ${filePath}:`, err);
      }
    }
  }
};

module.exports = {
  generateTestImage,
  generateVehiclePlateImage,
  cleanupTestImages
};