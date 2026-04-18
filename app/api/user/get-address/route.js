import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Address from "@/models/AddressModel";

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Get the authenticated user from Clerk
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // 2. Find all addresses for this specific user
        // .sort({ createdAt: -1 }) ensures the newest address shows first
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({ 
            success: true, 
            addresses 
        }, { status: 200 });

    } catch (error) {
        console.error("Get Address API Error:", error.message);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}