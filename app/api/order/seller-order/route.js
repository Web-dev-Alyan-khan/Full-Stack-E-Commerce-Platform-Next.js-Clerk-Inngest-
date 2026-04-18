import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Order from "@/models/OrderModel";
import authSeller from "@/lib/authSeller";
import Product from "@/models/productModel";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });
        }

        await dbConnect();

        // 1. Find all products belonging to this seller
        const sellerProducts = await Product.find({ userId }); 
        const sellerProductIds = sellerProducts.map(p => p._id.toString());

        // 2. Find orders that contain any of these product IDs
        // We use $elemMatch to look inside the items array
        const orders = await Order.find({
            "items.productId": { $in: sellerProductIds }
        }).sort({ date: -1 });

        // 3. Optional: Populate product details so the frontend has names/images
        // const orders = await Order.find({ "items.productId": { $in: sellerProductIds } })
        // .populate('items.productId')
        // .sort({ date: -1 });

        return NextResponse.json({ 
            success: true, 
            orders,
            count: orders.length 
        });

    } catch (error) {
        console.error("Seller Orders Fetch Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}