import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Order from "@/models/OrderModel";
import Address from "@/models/AddressModel"; // Ensure you import your Address model
import dbConnect from "@/config/db";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        // 1. Critical: Check if user is authenticated
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 2. Ensure DB is connected (added parentheses)
        await dbConnect();

        // 3. Fetch user addresses to check length
        const userAddresses = await Address.find({ userId });
        const addressCount = userAddresses.length;

        // Optional: If you want to block the list if they have 0 addresses
        /*
        if (addressCount === 0) {
            return NextResponse.json({ success: false, message: "No addresses found" }, { status: 404 });
        }
        */

        // 4. Fetch orders and sort by newest first
        const orders = await Order.find({ userId }).sort({ date: -1 });

        return NextResponse.json({ 
            success: true, 
            orders,
            addressLength: addressCount // Added address length to response
        });

    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}