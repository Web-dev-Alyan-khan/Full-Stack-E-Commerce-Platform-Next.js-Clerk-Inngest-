import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import dbConnect from "@/config/db";
import Product from "@/models/productModel";

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {

    const { userId } = getAuth(request);

      if (!userId) {
        return NextResponse.json({ success: false, message: "No active session found. Please log in again." }, { status: 401 });
        }
    // 2. Auth & Seller Check
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Only sellers can add products" }, { status: 401 });
    }

    // 3. Parse FormData
    const formData = await request.formData();

    const name = formData.get('name');
    const description = formData.get('description');
    const category = formData.get('category');
    const price = formData.get('price');
    const offerPrice = formData.get('offerPrice');

    // Extract files (images) from FormData
    const files = formData.getAll('image');

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No images provided" }, { status: 400 });
    }

    // 4. Upload Images to Cloudinary
    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          ).end(buffer);
        });
      })
    );

    // 5. Save to MongoDB
    await dbConnect();

    const newProduct = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      images: result, // Array of Cloudinary URLs
      userId,
      date: Date.now(),
    });

    return NextResponse.json({ 
      success: true, 
      message: "Product uploaded successfully!", 
      product: newProduct 
    });

  } catch (error) {
    console.error("Upload Error:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}