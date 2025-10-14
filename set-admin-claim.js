
const admin = require('firebase-admin');

// --- IMPORTANT ---
// You must replace this with the actual path to the service account key you will download.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// The UID of the user we are making an admin.
const uid = 'wk0B7BzrIqftgY8r7F65sLLAZhq2';

// Set the custom claim { admin: true } on the user account.
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('✅ Success!');
    console.log(`Custom claim { admin: true } was set on user UID: ${uid}`);
    console.log('\nNext steps:');
    console.log('  1. Update firestore.rules to check for this claim.');
    console.log('  2. The admin user must sign out and then sign back in to get the new token.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error setting custom claim:', error);
    process.exit(1);
  });
