/* eslint-disable no-console */
const webpush = require('web-push');

const keys = webpush.generateVAPIDKeys();

console.log('Add these to backend/.env:\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:you@example.com\n`);
console.log('The public key also needs to go in frontend/.env as VITE_VAPID_PUBLIC_KEY.');
