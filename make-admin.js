import { MongoClient } from 'mongodb';

async function makeUserAdmin(email) {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('resumebuilder');
    const collection = db.collection('users');
    
    // Update user to make them admin
    const result = await collection.updateOne(
      { email: email },
      { $set: { isAdmin: true } }
    );
    
    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else if (result.modifiedCount === 1) {
      console.log(`Successfully made ${email} an admin!`);
    } else {
      console.log(`User ${email} was already an admin.`);
    }
    
    // Show the updated user
    const user = await collection.findOne({ email: email });
    console.log('Updated user:', user);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
