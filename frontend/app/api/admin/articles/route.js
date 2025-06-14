// API route untuk admin blog
// Endpoint: /api/admin/articles

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("Starting to process article submission in frontend API route");
    const formData = await request.formData();
    console.log("Received form data with keys:", Array.from(formData.keys()));
    console.log("Form data values:", {
      title: formData.get("title"),
      category: formData.get("category"),
      hasImage: formData.has("image")
    });
    
    // We no longer need to save the image locally, just forward the form data
    const formDataToSend = new FormData();
    
    // Add all fields
    [
      "title", "slug", "excerpt", "content", "category", 
      "tags", "author", "readTime"
    ].forEach(field => {
      const value = formData.get(field);
      if (value) formDataToSend.append(field, value);
    });

    // Set defaults for optional fields
    if (!formDataToSend.has("author")) formDataToSend.append("author", "Tim EcoWaste");
    if (!formDataToSend.has("readTime")) formDataToSend.append("readTime", "5");
      // Handle image
    const image = formData.get("image");
    if (image && image instanceof Blob) {
      formDataToSend.append("image", image);
    }
      // Send to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/admin/articles`;
    console.log("Sending request to:", backendUrl);
    
    // Use node-fetch in API routes
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
      },
      body: formDataToSend,
      // Add a reasonable timeout
      signal: AbortSignal.timeout(30000) // 30 seconds timeout
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: 201 });
    } else {
      return NextResponse.json(
        { error: data.error || "Failed to save article" },
        { status: response.status }
      );
    }  } catch (error) {
    console.error("Error in API route admin/articles:", error);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: "Could not connect to backend server. Please ensure the server is running." },
        { status: 503 }
      );
    }
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred while saving the article" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Invalid article ID" },
        { status: 400 }
      );    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/admin/articles/${id}`, {
      method: "DELETE"
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(
        { error: data.error || "Failed to delete article" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
