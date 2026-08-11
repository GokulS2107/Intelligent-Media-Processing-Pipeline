const analyzeOCR = require('./src/services/ocr');

async function test() {
  const result = await analyzeOCR('./vehicle-plate.jpg');
  console.log(JSON.stringify(result, null, 2));
}

test();