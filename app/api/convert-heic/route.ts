import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic import to avoid build issues
    const heicConvert = (await import('heic-convert')).default;
    
    // Convert HEIC to JPEG
    const outputBuffer = await heicConvert({
      buffer: buffer,
      format: 'JPEG',
      quality: 0.85,
    });

    // Convert to base64
    const base64 = `data:image/jpeg;base64,${Buffer.from(outputBuffer).toString('base64')}`;

    return NextResponse.json({ success: true, data: base64 });
  } catch (error) {
    console.error('HEIC conversion error:', error);
    const message = error instanceof Error ? error.message : 'Conversion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

