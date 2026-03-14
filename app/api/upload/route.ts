import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Brak pliku' }, { status: 400 });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Plik musi być obrazem' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate buffer size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Plik jest zbyt duży' }, { status: 400 });
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'cars', resource_type: 'image' },
          (error, res) => {
            if (error) {
              console.error('[/api/upload] Cloudinary error:', error);
              reject(error);
            } else if (!res) {
              const err = new Error('Cloudinary returned empty response');
              console.error('[/api/upload] Error:', err);
              reject(err);
            } else {
              resolve(res as { secure_url: string; public_id: string });
            }
          },
        );

        uploadStream.on('error', (err) => {
          console.error('[/api/upload] Stream error:', err);
          reject(err);
        });

        uploadStream.end(buffer);
      },
    );

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('[/api/upload] Catch error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
    return NextResponse.json(
      { error: `Błąd przesyłania zdjęcia: ${errorMessage}` },
      { status: 500 },
    );
  }
}
