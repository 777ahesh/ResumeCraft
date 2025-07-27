import { MongoClient } from 'mongodb';

async function inspectResume() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('resumebuilder');
    const collection = db.collection('resumes');
    
    // Get one resume to inspect its structure
    const resume = await collection.findOne({});
    
    console.log('Resume structure:', JSON.stringify(resume, null, 2));
    
    if (resume) {
      console.log('\nResumeData structure:', JSON.stringify(resume.resumeData, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

inspectResume();
