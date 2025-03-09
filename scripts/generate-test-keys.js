const crypto = require('crypto');
const fs = require('fs');

// Generate key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Convert to base64
const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

// Update .env.test file
const envContent = `NODE_ENV=test
PORT=5001
DATABASE_URL=mongodb://localhost:27017/notes-test
REDIS_URL=redis://localhost:6379/1
ACCESS_TOKEN_PRIVATE_KEY=${privateKeyBase64}
ACCESS_TOKEN_PUBLIC_KEY=${publicKeyBase64}
REFRESH_TOKEN_PRIVATE_KEY=${privateKeyBase64}
REFRESH_TOKEN_PUBLIC_KEY=${publicKeyBase64}
COOKIES_DOMAIN=localhost
ORIGIN=http://localhost:3000
`;

fs.writeFileSync('.env.test', envContent);
console.log('Test keys generated and .env.test updated successfully!'); 