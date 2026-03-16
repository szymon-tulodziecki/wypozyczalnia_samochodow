import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudApiKey = process.env.CLOUDINARY_API_KEY;
const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: cloudApiKey,
  api_secret: cloudApiSecret,
});

export async function POST(req: NextRequest) {
  if (!cloudName || !cloudApiKey || !cloudApiSecret) {
    return NextResponse.json(
      {
        error:
          'Brak konfiguracji Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).',
      },
      { status: 500 },
    );
  }

  const { publicId } = await req.json() as { publicId: string };
  if (!publicId) return NextResponse.json({ error: 'Brak publicId' }, { status: 400 });

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  return NextResponse.json({ ok: true });
}
