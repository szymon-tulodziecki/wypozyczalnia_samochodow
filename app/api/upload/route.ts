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

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'cars', resource_type: 'image' }, (error, res) => {
            if (error || !res) reject(error ?? new Error('Upload failed'));
            else resolve(res as { secure_url: string; public_id: string });
          })
          .end(buffer);
      },
    );

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('[/api/upload] error:', JSON.stringify(err, null, 2));
    return NextResponse.json({ error: 'Błąd przesyłania zdjęcia' }, { status: 500 });
  }
}
