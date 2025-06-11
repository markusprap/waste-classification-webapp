// API route untuk admin blog
// Endpoint: /api/admin/articles

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("Received form data with keys:", Array.from(formData.keys()));
    
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
      formDataToSend.append("file", image);
    }
    
    // Send to backend
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/v1/articles`;
    console.log("Sending request to:", backendUrl);
    
    const response = await fetch(backendUrl, {
      method: "POST",
      body: formDataToSend
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: 201 });
    } else {
      return NextResponse.json(
        { error: data.error || "Failed to save article" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error in API route admin/articles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/v1/articles/${id}`, {
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
