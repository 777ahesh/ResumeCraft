import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function extractTextFromPDF(file: File): Promise<string> {
  console.log('🔍 Starting PDF text extraction...');
  
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('📄 PDF file size:', arrayBuffer.byteLength, 'bytes');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log('📖 PDF loaded successfully. Pages:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`📃 Processing page ${pageNum}/${pdf.numPages}`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => {
          // Handle text items with str property
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      
      console.log(`📝 Page ${pageNum} text length:`, pageText.length);
      
      fullText += pageText + '\n';
    }
    
    console.log('✅ PDF text extraction complete. Total length:', fullText.length);
    console.log('📄 Extracted text preview:', fullText.substring(0, 500));
    
    return fullText.trim();
    
  } catch (error) {
    console.error('❌ PDF text extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Alternative extraction method that preserves more formatting
export async function extractTextFromPDFWithFormatting(file: File): Promise<string> {
  console.log('🔍 Starting PDF text extraction with formatting...');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log('📖 PDF loaded. Pages:', pdf.numPages);
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let pageText = '';
      let lastY = -1;
      
      textContent.items.forEach((item: any) => {
        if ('str' in item && 'transform' in item) {
          const currentY = item.transform[5]; // Y coordinate
          
          // Add line break if Y position changed significantly (new line)
          if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
            pageText += '\n';
          }
          
          pageText += item.str + ' ';
          lastY = currentY;
        }
      });
      
      fullText += pageText + '\n\n';
    }
    
    console.log('✅ Formatted PDF text extraction complete');
    return fullText.trim();
    
  } catch (error) {
    console.error('❌ Formatted PDF text extraction error:', error);
    throw new Error(`Failed to extract formatted text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
