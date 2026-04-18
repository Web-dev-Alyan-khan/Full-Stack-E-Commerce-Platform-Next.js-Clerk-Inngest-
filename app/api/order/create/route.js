import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Product from "@/models/productModel";
import { inngest } from "@/config/inngest";

export async function POST(request) {
    try {
        await dbConnect();
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { address, items } = await request.json();

        // Validation to ensure data exists
        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
        }

        let amount = 0;
        
        // Use Promise.all if you have many items for faster performance, 
        // or keep the loop for simpler logic.
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json({ 
                    success: false, 
                    message: `Product not found: ${item.productId}` 
                }, { status: 404 });
            }
            // Use offerPrice as per your logic
            amount += product.offerPrice * item.quantity;
        }

        // Add 2% Tax
        const finalAmount = amount + Math.floor(amount * 0.02);

        // Send event to Inngest
        // Ensure name matches exactly with your Inngest function trigger
        await inngest.send({
            name: "order/create",
            data: {
                userId,
                items,
                amount: finalAmount,
                address, // This passes the full address object for the snapshot
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: "Order is being processed" 
        });

    } catch (error) {
        console.error("Order API Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to create order. Please try again." 
        }, { status: 500 });
    }
}