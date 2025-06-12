import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { canUserClassify } from '@/lib/user-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.error('No session or user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('Session user email:', session.user.email);

    let user;
    let backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log('Mengambil data user dari backend:', backendUrl);
    
    try {
      console.log('Mengirim request ke endpoint profile');
      const userProfileRes = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
        cache: 'no-store'
      });
      
      console.log('Response status dari backend:', userProfileRes.status);
      
      if (!userProfileRes.ok) {
        const errText = await userProfileRes.text();
        console.error('Error dari backend:', errText);
        
        console.log('Menggunakan data fallback karena backend error');
        user = {
          id: session.user.id || 'temp-user-id',
          email: session.user.email,
          name: session.user.name || 'User',
          plan: 'free',
          usageCount: 0,
          usageLimit: 30
        };
      } else {
        const userProfileData = await userProfileRes.json();
        console.log('Data user dari backend:', JSON.stringify(userProfileData));
        
        if (userProfileData && userProfileData.data) {
          user = userProfileData.data;
        } else if (userProfileData) {
          user = userProfileData;
        }
        
        if (!user || !user.id) {
          console.error('Data user tidak valid:', user);
          user = {
            id: session.user.id || 'temp-user-id',
            email: session.user.email,
            name: session.user.name || 'User',
            plan: 'free',
            usageCount: 0,
            usageLimit: 30
          };
        }
      }
    } catch (userError) {
      console.error('Exception saat mengambil user data:', userError);
      user = {
        id: session.user.id || 'temp-user-id',
        email: session.user.email,
        name: session.user.name || 'User',
        plan: 'free',
        usageCount: 0,
        usageLimit: 30
      };
    }
    
    console.log('User data yang digunakan:', user);

    const limit = user.plan === 'free' ? 30 : 
                 user.plan === 'premium' ? 10000 : 
                 Infinity;
    if (user.usageCount >= limit) {
      return NextResponse.json(
        { 
          error: user.plan === 'free' ? 'Daily free classification limit reached' : 'Daily premium classification limit reached',
          message: user.plan === 'free' 
            ? 'You have reached your daily free classification limit. Please upgrade to premium for more classifications.' 
            : 'You have reached your premium classification limit.',
          limit: user.plan === 'free' ? 30 : user.plan === 'premium' ? 10000 : 'unlimited',
          plan: user.plan,
          requireUpgrade: user.plan === 'free' ? true : false,
          upgradeUrl: '/payment',
          usageCount: user.usageCount
        },
        { status: 429 }
      );
    }

    let imageData, location;
    try {
      const body = await request.json();
      imageData = body.imageData;
      location = body.location;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    let base64Data;
    try {
      base64Data = imageData.split(',')[1];
    } catch (imgError) {
      console.error('Invalid image data format:', imgError);
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'image.jpg');

    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    let classificationResult;
    
    try {
      console.log('Calling ML service at:', `${ML_SERVICE_URL}/api/classify`);
      
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!mlResponse.ok) {
        throw new Error(`ML service error: ${mlResponse.status} ${mlResponse.statusText}`);
      }

      const mlResult = await mlResponse.json();
      console.log('ML service response:', JSON.stringify(mlResult));
      
      if (mlResult.success && mlResult.data) {
        const { getWasteManagementMethod } = await import('@/services/wasteManagementService');
        
        const mainCategory = mlResult.data.main_category;
        const subCategory = mlResult.data.subcategory;
        
        console.log('Hasil klasifikasi dari ML:', {
          mainCategory: mainCategory,
          subCategory: subCategory,
          confidence: mlResult.data.confidence
        });
        
        const wasteMethod = getWasteManagementMethod({
          mainCategory: mainCategory,
          type: subCategory
        });
        
        classificationResult = {
          type: subCategory, 
          typeId: subCategory,
          category: subCategory,
          categoryId: subCategory,
          mainCategory: mainCategory,
          confidence: Math.round(mlResult.data.confidence * 100),
          description: `This item is classified as ${subCategory} (${mainCategory})`,
          descriptionId: `Item ini diklasifikasikan sebagai ${subCategory} (${mainCategory})`,
          disposal: "Please dispose of this item appropriately based on its category",
          disposalId: "Silakan buang item ini dengan tepat berdasarkan kategorinya",
          recommendation: "Follow local waste management guidelines",
          recommendationId: "Ikuti panduan pengelolaan sampah setempat",
          method: wasteMethod,
        };
      } else {
        throw new Error('Invalid ML service response');
      }
    } catch (mlError) {
      console.error('ML service error:', mlError);
      
      const { getWasteManagementMethod } = await import('@/services/wasteManagementService');
      
      classificationResult = {
        type: "Unknown_Waste",
        typeId: "Unknown_Waste",
        category: "Unknown_Waste",
        categoryId: "Unknown_Waste",
        mainCategory: "Mixed/Other",
        confidence: 50,
        description: "Unable to classify this waste accurately - ML service unavailable",
        descriptionId: "Tidak dapat mengklasifikasi sampah ini dengan akurat - layanan ML tidak tersedia",
        disposal: "Place in general waste bin",
        disposalId: "Masukkan ke tempat sampah umum",
        recommendation: "Consider manual sorting or ask waste management professionals",
        recommendationId: "Pertimbangkan pemisahan manual atau tanya profesional pengelolaan sampah",
        method: getWasteManagementMethod({ mainCategory: "Mixed/Other" }),
      };
      console.log('Using fallback classification due to ML service error');
    }
    
    let classificationId = Date.now().toString();
    
    try {
      const classification = await prisma.classification.create({
        data: {
          userId: user.id,
          result: JSON.stringify(classificationResult),
          location: location ? JSON.stringify(location) : null
        }
      });
      classificationId = classification.id;
      console.log('Classification saved to local database:', classificationId);
    } catch (classError) {
      console.error('Failed to save classification locally:', classError);
    }
    
    try {
      console.log('Incrementing usage count for user:', user.id);
      const syncResponse = await fetch(`${backendUrl}/api/users/update-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id
        })
      });
      
      if (!syncResponse.ok) {
        const errText = await syncResponse.text();
        console.error('Gagal increment usage count:', errText);
      } else {
        const syncResult = await syncResponse.json();
        console.log('Berhasil increment usage count:', JSON.stringify(syncResult));
        
        if (syncResult && syncResult.data && typeof syncResult.data.usageCount === 'number') {
          user.usageCount = syncResult.data.usageCount;
          console.log('Updated user count to:', user.usageCount);
        } else {
          user.usageCount = (user.usageCount || 0) + 1;
          console.log('Incremented count locally to:', user.usageCount);
        }
      }
    } catch (syncError) {
      console.error('Error saat increment usage count:', syncError);
      user.usageCount = (user.usageCount || 0) + 1;
      console.log('Incremented count locally due to error:', user.usageCount);
    }

    console.log('Sending classification response');
    return NextResponse.json({
      success: true,
      classification: {
        id: classificationId,
        ...classificationResult,
        timestamp: new Date()
      },
      user: user,
      usage: {
        today: user.usageCount || 0,
        limit: user.plan === 'free' ? 30 : user.plan === 'premium' ? 10000 : 'unlimited',
        remaining: user.plan === 'free' 
          ? Math.max(0, 30 - (user.usageCount || 0))
          : user.plan === 'premium'
            ? Math.max(0, 10000 - (user.usageCount || 0))
            : 'unlimited'
      }
    });
  } catch (error) {
    console.error('Classification error:', error);
    
    if (error.message && error.message.includes('model') || error.message.includes('tensor')) {
      return NextResponse.json(
        { error: 'AI model error. Please try again or contact support.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}
