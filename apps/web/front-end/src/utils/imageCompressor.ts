/**
 * Utilitas kompresi gambar berbasis HTML5 Canvas untuk sisi klien.
 * Mengurangi ukuran file foto (hingga 2MB) menjadi ~100-250KB dalam format JPEG/WebP.
 * Menghasilkan instance File valid agar lolos validasi mimes backend Laravel.
 */

export interface ImageCompressOptions {
  maxDimension?: number; // Maksimal lebar atau tinggi dalam piksel (default: 1280px)
  quality?: number; // Kualitas kompresi 0.1 - 1.0 (default: 0.82)
  minSizeToCompressBytes?: number; // Batas minimal ukuran file untuk dikompres (default: 300KB)
}

export async function compressImageFile(
  file: File,
  options: ImageCompressOptions = {}
): Promise<File> {
  const {
    maxDimension = 1280,
    quality = 0.82,
    minSizeToCompressBytes = 300 * 1024,
  } = options;

  // Jika bukan file gambar atau ukurannya sudah di bawah batas minimum, kembalikan file asli
  if (!file.type.startsWith('image/') || file.size <= minSizeToCompressBytes) {
    return file;
  }

  // File SVG tidak perlu dan tidak boleh dikompres lewat Canvas
  if (file.type.includes('svg')) {
    return file;
  }

  let objectUrl: string | null = null;

  try {
    objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = objectUrl as string;
    });

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    if (originalWidth === 0 || originalHeight === 0) {
      return file;
    }

    // Hitung dimensi proporsional dengan batas maksimal maxDimension
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (originalWidth > maxDimension || originalHeight > maxDimension) {
      if (originalWidth >= originalHeight) {
        targetWidth = maxDimension;
        targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });

    if (!blob) {
      return file;
    }

    // Jika hasil kompresi malah lebih besar dari file asli, gunakan file asli
    if (blob.size >= file.size) {
      return file;
    }

    // Ubah ekstensi ke .jpg jika sebelumnya PNG / format lain
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const outputFileName = `${baseName}.jpg`;

    return new File([blob], outputFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    // Fallback aman jika terjadi error Canvas / ObjectURL
    return file;
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

