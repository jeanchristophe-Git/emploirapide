import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<string> {
  try {
    const options = {
      maxSizeMB: 0.5, // Compress to max 500KB
      maxWidthOrHeight: 1024, // Max dimension
      useWebWorker: true,
      fileType: file.type as any,
    };

    const compressedFile = await imageCompression(file, options);

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    // Fallback to original file if compression fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
