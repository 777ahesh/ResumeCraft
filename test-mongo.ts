// Simple MongoDB connection test
import mongoose from 'mongoose';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    const connectionString = 'mongodb://localhost:27017/resumebuilder';
    console.log(`Connecting to: ${connectionString}`);
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    
    console.log('✅ Document creation successful!');
    
    // Cleanup
    await TestModel.deleteMany({});
    console.log('✅ Cleanup successful!');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

testConnection();
