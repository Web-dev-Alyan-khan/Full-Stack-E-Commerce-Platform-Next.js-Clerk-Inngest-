import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import User from "@/models/userModel"; // Ensure this import is EXACT

export async function POST(request) {
    try {
        await dbConnect();

        // Pass 'request' so Clerk can see the headers
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { cartData } = await request.json();

        // Logic Fix: Use findOneAndUpdate with clerkId
        // This handles both existing users and avoids 'save()' crashes
   const user = await User.findByIdAndUpdate(
    userId, // No object needed here for findById
    { cartItems: cartData },
    { new: true, upsert: true }
);

        return NextResponse.json({ success: true, cartItems: user.cartItems });

    } catch (error) {
        // This will show exactly WHAT is wrong in your Terminal (not browser console)
        console.error("CRITICAL BACKEND ERROR:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}