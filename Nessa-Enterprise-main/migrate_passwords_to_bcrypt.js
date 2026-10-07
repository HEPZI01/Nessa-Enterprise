const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

async function migratePasswords() {
  console.log('🔒 Starting Safe Password Migration to Bcrypt...');

  await connectDB();

  const users = await User.find();
  let migratedCount = 0;
  let alreadyHashedCount = 0;

  for (const u of users) {
    const pwd = u.password || '';
    const isBcryptHash = pwd.startsWith('$2a$') || pwd.startsWith('$2b$');

    if (!isBcryptHash) {
      const hashedPassword = await bcrypt.hash(pwd, 10);
      u.password = hashedPassword;
      await u.save();
      migratedCount++;
    } else {
      alreadyHashedCount++;
    }
  }

  console.log('\n========================================');
  console.log(`Total Users Processed: ${users.length}`);
  console.log(`Passwords Migrated to Bcrypt: ${migratedCount}`);
  console.log(`Passwords Already Hashed: ${alreadyHashedCount}`);
  console.log('Password Migration Completed Successfully.');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

migratePasswords().catch(err => {
  console.error('❌ Password Migration Error:', err);
  process.exit(1);
});
