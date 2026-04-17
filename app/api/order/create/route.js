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

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
        }

        // Correctly calculate amount with async DB calls
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                amount += product.offerPrice * item.quantity;
            }
        }

        // Add 2% Tax
        amount += Math.floor(amount * 0.02);

        // Send event to Inngest
        await inngest.send({
            name: "order/create",
            data: {
                userId,
                items,
                amount,
                address,
            },
        });

        return NextResponse.json({ success: true, message: "Order is being processed" });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}