import { cloudinary } from '../config/cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';

interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<UploadResult> {
  // Convert to WebP with sharp
  const webpBuffer = await sharp(buffer)
    .resize(options.width, options.height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: options.quality ?? 90 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `photo-portfolio/${folder}`,
        resource_type: 'image',
        format: 'webp',
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    const readable = new Readable();
    readable.push(webpBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export async function destroyFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export function buildTransformUrl(publicId: string, transformation: string): string {
  return cloudinary.url(publicId, {
    transformation: [{ raw_transformation: transformation }],
    secure: true,
  });
}
