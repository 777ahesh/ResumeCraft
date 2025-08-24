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

    if (!element) throw new Error('Element is null or undefined');
    if (!element.offsetWidth || !element.offsetHeight) throw new Error('Element has no visible dimensions');

    // Wait for images to load
    const images = element.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 5000);
        });
      }));
    }

    // Create a high-resolution canvas capture of the element
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS,
      allowTaint,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      removeContainer: true,
      logging: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.resume-canvas') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.transformOrigin = 'none';
        }
      }
    });

    console.log('Canvas created successfully:', { width: canvas.width, height: canvas.height });

    // Setup PDF page sizes and margins (mm)
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidthMM = pdf.internal.pageSize.getWidth();
    const pageHeightMM = pdf.internal.pageSize.getHeight();
    const marginMM = 10; // 10mm margins
    const printableWidthMM = pageWidthMM - marginMM * 2;
    const printableHeightMM = pageHeightMM - marginMM * 2;

    // Determine how many canvas pixels correspond to the printable height for one PDF page
    // We will slice the large canvas vertically into page-sized canvas chunks so each page fills width
    const pxPerMM = canvas.width / (printableWidthMM * (96 / 25.4));
    // Fallback: compute based on ratio of canvas pixels to printable width
    const pageCanvasHeightPx = Math.floor((canvas.width * printableHeightMM) / printableWidthMM);

    console.log('PDF page settings:', { pageWidthMM, pageHeightMM, printableWidthMM, printableHeightMM, pageCanvasHeightPx });

    // Convert canvas to pages by slicing height
    let yOffset = 0;
    const pageBlobs: Blob[] = [];

    while (yOffset < canvas.height) {
      const sliceHeight = Math.min(pageCanvasHeightPx, canvas.height - yOffset);

      // Create page canvas and draw slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas context for page slice');
      ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      // Convert page slice to image data (JPEG for smaller size)
      const pageData = pageCanvas.toDataURL('image/jpeg', quality);

      // Calculate PDF image height in mm based on width scaling
      const pageImgHeightMM = (sliceHeight * printableWidthMM) / canvas.width;

      // Add to PDF
      if (yOffset === 0) {
        pdf.addImage(pageData, 'JPEG', marginMM, marginMM, printableWidthMM, pageImgHeightMM);
      } else {
        pdf.addPage();
        pdf.addImage(pageData, 'JPEG', marginMM, marginMM, printableWidthMM, pageImgHeightMM);
      }

      console.log('Added page slice to PDF:', { yOffset, sliceHeight, pageImgHeightMM });

      yOffset += sliceHeight;
    }

    // Output blob
    const blob = pdf.output('blob');
    console.log('PDF generated successfully with blob size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
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
