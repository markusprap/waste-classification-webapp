import { NextResponse } from 'next/server';

// GET /api/waste-banks/[id] - Get single waste bank by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const backendApiUrl = new URL(`/api/waste-banks/${id}`, backendUrl);

    console.log('Fetching waste bank from backend:', backendApiUrl.toString());

    // Call backend API
    const response = await fetch(backendApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching waste bank from backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch waste bank from backend',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT /api/waste-banks/[id] - Update waste bank
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Get backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const backendApiUrl = new URL(`/api/waste-banks/${id}`, backendUrl);

    console.log('Updating waste bank in backend:', backendApiUrl.toString());

    // Call backend API
    const response = await fetch(backendApiUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating waste bank in backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update waste bank in backend',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/waste-banks/[id] - Delete waste bank (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const backendApiUrl = new URL(`/api/waste-banks/${id}`, backendUrl);

    console.log('Deleting waste bank in backend:', backendApiUrl.toString());

    // Call backend API
    const response = await fetch(backendApiUrl.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error deleting waste bank in backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete waste bank in backend',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
