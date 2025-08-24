import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface HTMLToPDFOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
}

export const generatePDFFromElement = async (
  element: HTMLElement,
  options: HTMLToPDFOptions = {}
): Promise<Blob> => {
  const {
    filename = 'resume.pdf',
    quality = 1.0,
    scale = 2,
    useCORS = true,
    allowTaint = true
  } = options;

  try {
    console.log('Starting PDF generation for element:', element);
    
    // Validate element
    if (!element) {
      throw new Error('Element is null or undefined');
    }
    
    if (!element.offsetWidth || !element.offsetHeight) {
      throw new Error('Element has no visible dimensions');
    }
    
    console.log('Element dimensions:', {
      width: element.scrollWidth,
      height: element.scrollHeight,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight
    });

    // Wait for any images to load
    const images = element.querySelectorAll('img');
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load...`);
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Don't fail if image doesn't load
          setTimeout(resolve, 5000); // Timeout after 5 seconds
        });
      }));
    }

    // Configure html2canvas options for high quality capture
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: useCORS,
      allowTaint: allowTaint,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      removeContainer: true,
      logging: true, // Enable logging for debugging
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      // Additional options for better compatibility
      foreignObjectRendering: false,
      onclone: (clonedDoc) => {
        // Ensure styles are applied to cloned document
        const clonedElement = clonedDoc.querySelector('.resume-canvas') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.transformOrigin = 'none';
        }
      }
    });

    console.log('Canvas created successfully:', {
      width: canvas.width,
      height: canvas.height
    });

    // Get canvas dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Calculate aspect ratio
    const aspectRatio = imgHeight / imgWidth;
    
    // Calculate dimensions to fit within PDF page
    let finalWidth = pdfWidth - 20; // 10mm margin on each side
    let finalHeight = finalWidth * aspectRatio;
    
    // If height exceeds page, scale down
    if (finalHeight > pdfHeight - 20) { // 10mm margin top/bottom
      finalHeight = pdfHeight - 20;
      finalWidth = finalHeight / aspectRatio;
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: finalHeight > finalWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Center the image on the page
    const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
    const y = (pdf.internal.pageSize.getHeight() - finalHeight) / 2;
    
    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

    console.log('PDF generated successfully with dimensions:', {
      pdfWidth: pdf.internal.pageSize.getWidth(),
      pdfHeight: pdf.internal.pageSize.getHeight(),
      imageWidth: finalWidth,
      imageHeight: finalHeight,
      x, y
    });

    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error details:', error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error);
    throw new Error('Failed to generate PDF from HTML element');
  }
};

export const downloadPDFFromElement = async (
  element: HTMLElement,
  filename: string = 'resume.pdf',
  options: HTMLToPDFOptions = {}
): Promise<void> => {
  try {
    console.log('downloadPDFFromElement called with:', { element, filename, options });
    
    // Ensure element is visible and has dimensions
    if (!element.offsetWidth || !element.offsetHeight) {
      console.warn('Element has no dimensions, waiting for layout...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const pdfBlob = await generatePDFFromElement(element, { ...options, filename });
    
    console.log('PDF blob generated:', { size: pdfBlob.size, type: pdfBlob.type });
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Download link clicked, PDF should download');
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

export const getPDFBase64FromElement = async (
  element: HTMLElement,
  options: HTMLToPDFOptions = {}
): Promise<string> => {
  try {
    const pdfBlob = await generatePDFFromElement(element, options);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:application/pdf;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error('Error generating PDF base64:', error);
    throw error;
  }
};
