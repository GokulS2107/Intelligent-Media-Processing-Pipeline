require('dotenv').config();

console.log('=== Environment Variables ===');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'NOT SET');
console.log('REDIS_PORT:', process.env.REDIS_PORT || 'NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('==============================');

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('\n.env content:');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content);
}