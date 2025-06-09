import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    // Forward all search parameters to backend
    const backendApiUrl = new URL('/api/waste-banks', backendUrl)
    
    // Copy all search parameters
    for (const [key, value] of searchParams.entries()) {
      backendApiUrl.searchParams.set(key, value)
    }

    console.log('Fetching from backend:', backendApiUrl.toString())

    // Call backend API
    const response = await fetch(backendApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching waste banks from backend:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch waste banks from backend',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Get backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const backendApiUrl = new URL('/api/waste-banks', backendUrl)

    // Call backend API
    const response = await fetch(backendApiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error creating waste bank in backend:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create waste bank in backend',
        details: error.message 
      },
      { status: 500 }    )
  }
}
