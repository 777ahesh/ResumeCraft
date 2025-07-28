import mammoth from 'mammoth';

export async function extractTextFromWord(file: File): Promise<string> {
  console.log('🔍 Starting Word document text extraction...');
  
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('📄 Word file size:', arrayBuffer.byteLength, 'bytes');
    
    // Extract text using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('✅ Word text extraction complete. Length:', result.value.length);
    console.log('📝 Extracted text preview:', result.value.substring(0, 500));
    
    // Log any warnings
    if (result.messages.length > 0) {
      console.log('⚠️ Word extraction warnings:', result.messages);
    }
    
    return result.value;
    
  } catch (error) {
    console.error('❌ Word text extraction error:', error);
    throw new Error(`Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Alternative method that preserves some formatting
export async function extractTextFromWordWithFormatting(file: File): Promise<string> {
  console.log('🔍 Starting Word document text extraction with basic formatting...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Extract with basic HTML conversion to preserve some structure
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    // Convert HTML to plain text but preserve line breaks
    const htmlText = result.value;
    const textWithBreaks = htmlText
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/h[1-6]>/g, '\n\n')
      .replace(/<\/li>/g, '\n')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple line breaks
      .trim();
    
    console.log('✅ Formatted Word text extraction complete');
    console.log('📝 Formatted text preview:', textWithBreaks.substring(0, 500));
    
    return textWithBreaks;
    
  } catch (error) {
    console.error('❌ Formatted Word text extraction error:', error);
    throw new Error(`Failed to extract formatted text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
