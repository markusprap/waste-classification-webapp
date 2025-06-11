import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }
    
    // Call the backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/articles/slug/${slug}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch article' },
        { status: response.status }
      );
    }
    
    const article = await response.json();
    
    // Fetch related articles based on category
    let relatedArticles = [];
    if (article.category) {
      const relatedResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/articles?category=${encodeURIComponent(article.category)}&limit=3`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        }
      );
      
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        // Filter out the current article from related articles
        relatedArticles = relatedData.articles.filter(a => a.id !== article.id).slice(0, 3);
      }
    }
    
    return NextResponse.json({
      ...article,
      relatedArticles
    });
    
  } catch (error) {
    console.error('Error in article slug API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
