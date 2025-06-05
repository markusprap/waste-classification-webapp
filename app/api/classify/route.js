import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { canUserClassify, updateUserUsage } from '@/lib/user-utils';
import { prisma } from '@/lib/prisma';
import { classifyWasteImage } from '@/lib/tensorflow-model';

export async function POST(request) {
  try {
    // Get session instead of token verification
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data using session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }// Check if user can classify (rate limiting)
    const canClassify = await canUserClassify(user);
    if (!canClassify.allowed) {
      return NextResponse.json(
        { 
          error: canClassify.reason,
          limit: user.plan === 'free' ? 5 : user.plan === 'premium' ? 50 : 'unlimited',
          plan: user.plan
        },
        { status: 429 }
      );
    }

    const { imageData, location } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }    // Here you would integrate with your AI model
    // Convert base64 to file-like object for classification
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a mock file object for the TensorFlow model
    const mockFile = {
      buffer,
      type: 'image/jpeg', // Default type, could be improved to detect actual type
      size: buffer.length,
      // Add methods that the TensorFlow model might expect
      arrayBuffer: () => Promise.resolve(buffer),
      stream: () => new ReadableStream({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        }
      })    };    // Perform classification using existing TensorFlow model
    let classificationResult;
    try {
      console.log('🔍 Starting API waste classification...');
      classificationResult = await classifyWasteImage(mockFile, 'en');
      console.log('✅ API Classification result received successfully');
    } catch (modelError) {
      console.error('TensorFlow model error:', modelError);
      // Fallback to mock classification if model fails - using proper format for frontend
      classificationResult = {
        type: "Unknown Waste",
        typeId: "Sampah Tidak Dikenal",
        category: "General Waste",
        categoryId: "Sampah Umum",
        confidence: 50,
        description: "Unable to classify this waste accurately",
        descriptionId: "Tidak dapat mengklasifikasi sampah ini dengan akurat",
        disposal: "Place in general waste bin",
        disposalId: "Masukkan ke tempat sampah umum",
        recommendation: "Consider manual sorting or ask waste management professionals",
        recommendationId: "Pertimbangkan pemisahan manual atau tanya profesional pengelolaan sampah",
        method: "reduce",
      };
      console.log('⚠️ Using fallback classification due to model error');
    }// Save classification to database
    const classification = await prisma.classification.create({
      data: {
        userId: user.id,
        result: JSON.stringify(classificationResult),
        location: location ? JSON.stringify(location) : null
      }
    });

    // Update user usage
    await updateUserUsage(user.id);    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        usageCount: true,
        usageLimit: true,
        lastUsageReset: true
      }
    });

    return NextResponse.json({
      success: true,
      classification: {
        id: classification.id,
        ...classificationResult,
        timestamp: classification.createdAt
      },
      user: updatedUser,
      usage: {
        today: updatedUser.usageCount,
        limit: user.plan === 'free' ? 5 : user.plan === 'premium' ? 50 : 'unlimited',
        remaining: user.plan === 'free' 
          ? Math.max(0, 5 - updatedUser.usageCount)
          : user.plan === 'premium'
            ? Math.max(0, 50 - updatedUser.usageCount)
            : 'unlimited'
      }
    });
  } catch (error) {
    console.error('Classification error:', error);
    
    // Handle specific TensorFlow/model errors
    if (error.message.includes('model') || error.message.includes('tensor')) {
      return NextResponse.json(
        { error: 'AI model error. Please try again or contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
