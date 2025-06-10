// API route untuk admin blog
// Endpoint: /api/admin/articles

import { NextResponse } from "next/server";
import { writeFile, mkdir, access, unlink } from "fs/promises";
import { join } from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    console.log("Received form data with keys:", Array.from(formData.keys()));

    let coverImage = null;
    
    // Handle image upload if present
    const image = formData.get("image");
    
    if (image && image instanceof Blob) {
      console.log("Processing image:", {
        name: image.name,
        type: image.type,
        size: image.size
      });
      
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create unique filename
      const timestamp = Date.now();
      const originalName = image.name;
      const ext = originalName.split(".").pop();
      const filename = `${timestamp}.${ext}`;
      
      // Save file
      const uploadDir = join(process.cwd(), "public/uploads/articles");
      try {
        await access(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);
      
      // Set cover image URL
      coverImage = `/uploads/articles/${filename}`;
      
      console.log("Image saved locally:", coverImage);
    } else if (image && typeof image === "string") {
      // If image is already a URL string, use it directly
      coverImage = image;
      console.log("Using provided image URL:", coverImage);
    }
    
    // Prepare form data for backend
    const formDataToSend = new FormData();
    
    // Add all text fields
    formDataToSend.append("title", formData.get("title") || "");
    formDataToSend.append("slug", formData.get("slug") || "");
    formDataToSend.append("excerpt", formData.get("excerpt") || "");
    formDataToSend.append("content", formData.get("content") || "");
    formDataToSend.append("category", formData.get("category") || "");
    formDataToSend.append("tags", formData.get("tags") || "");
    formDataToSend.append("author", formData.get("author") || "Tim EcoWaste");
    formDataToSend.append("readTime", formData.get("readTime") || "5");
    
    // If we have a locally stored image, add it to the form data
    if (coverImage) {
      console.log("Adding coverImage to formData:", coverImage);
      formDataToSend.append("coverImage", coverImage);
    }
    
    // If we have an actual file, add it as "file"
    if (image && image.size > 0 && image instanceof Blob) {
      console.log("Adding file to formData with size:", image.size, "and type:", image.type);
      formDataToSend.append("file", image);
    }
    
    console.log("Sending data to backend:", {
      title: formData.get("title"),
      slug: formData.get("slug"),
      hasCoverImage: !!coverImage,
      hasFile: !!(image && image.size > 0)
    });
    
    // Kirim data ke backend
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/v1/articles`;
    console.log("Sending request to:", backendUrl);
    
    const response = await fetch(backendUrl, {
      method: "POST",
      body: formDataToSend
    });

    // Parse response dari backend
    const data = await response.json();
    
    // Jika berhasil
    if (response.ok) {
      return NextResponse.json(data, { status: 201 });
    } else {
      // Hapus file gambar jika gagal menyimpan artikel
      if (coverImage && coverImage.startsWith("/uploads/")) {
        try {
          const filePath = join(process.cwd(), "public", coverImage);
          await unlink(filePath);
          console.log("Removed temporary image file after failure:", filePath);
        } catch (err) {
          console.error("Error removing image file:", err);
        }
      }
      
      return NextResponse.json(
        { error: data.error || "Gagal menyimpan artikel" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error di API route admin/articles:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Get article ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    // Validasi ID
    if (!id) {
      return NextResponse.json(
        { error: "ID artikel tidak valid." },
        { status: 400 }
      );
    }
    
    // Kirim permintaan hapus ke backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/v1/articles/${id}`, {
      method: "DELETE"
    });
    
    // Parse response dari backend
    const data = await response.json();
    
    // Jika berhasil
    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    } else {
      // Jika gagal
      return NextResponse.json(
        { error: data.error || "Gagal menghapus artikel" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
