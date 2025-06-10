import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';
import { cwd } from 'process';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.name.replace(/\.[^/.]+$/, '') + '-' + uniqueSuffix + '.' + file.type.split('/')[1];

    // Save to public/uploads directory
    const uploadDir = join(cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);
    
    await writeFile(filePath, buffer);

    // Return the URL that can be used to access the image
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      url: imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
