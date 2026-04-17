import { NextResponse } from "next/server";
import authSeller from "@/lib/authSeller";
import Product from "@/models/productModel";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";

export async function GET(request) {
    try {
        // 1. getAuth needs the request object to find the session
        const { userId } = getAuth(request);

        // 2. Check if user is a seller (usually requires 'await')
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 3. Connect to database
        await dbConnect();

        // 4. Fetch products (Optionally filter by userId if you only want that seller's products)
        const products = await Product.find({ userId });

        return NextResponse.json({ success: true, products });

    } catch (error) {
        console.error("Fetch Products Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}