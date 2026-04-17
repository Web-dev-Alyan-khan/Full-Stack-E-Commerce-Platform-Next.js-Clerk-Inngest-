import dbConnect from "@/config/db";
import User from "@/models/userModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // 1. Get userId from Clerk
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 2. Wait for DB Connection
        await dbConnect();

        // 3. Find user. 
        const user = await User.findById(userId);

        if (!user) {
            // If user is not in DB yet, don't crash, just tell the frontend
            return NextResponse.json({ success: false, message: "User not found in database" }, { status: 200 });
        }

        // 4. Return success
        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Database Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: "Internal Server Error",
            error: error.message 
        }, { status: 500 });
    }
}