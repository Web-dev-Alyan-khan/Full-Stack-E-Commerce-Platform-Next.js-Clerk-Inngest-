import { NextResponse } from "next/server";
import Product from "@/models/productModel";
import dbConnect from "@/config/db";

export async function GET(request) {
    try {
       
        await dbConnect();

        // 4. Fetch products (Optionally filter by userId if you only want that seller's products)
        const products = await Product.find({});

        return NextResponse.json({ success: true, products });

    } catch (error) {
        console.error("Fetch Products Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}