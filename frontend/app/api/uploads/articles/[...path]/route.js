import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { path } = params;
        const imagePath = path.join('/');

        // Get image from backend
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3003';
        const imageUrl = `${backendUrl}/uploads/articles/${imagePath}`;

        console.log('Fetching article image from:', imageUrl);

        const response = await fetch(imageUrl, {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) {
            // Return placeholder image if not found
            return NextResponse.redirect(new URL('/images/placeholders/placeholder.jpg', request.url));
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (error) {
        console.error('Error fetching article image:', error);
        return NextResponse.redirect(new URL('/images/placeholders/placeholder.jpg', request.url));
    }
}
