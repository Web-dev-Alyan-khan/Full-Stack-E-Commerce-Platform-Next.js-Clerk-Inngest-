import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Address from "@/models/AddressModel";

export async function GET(request) {
    try {
        // 1. Connect to the database
        await dbConnect();

        // 2. Authenticate the user using Clerk
        const { userId } = getAuth(request);

        // 3. If no user is logged in, return unauthorized
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // 4. Find all addresses belonging to this specific userId
        // .sort({ createdAt: -1 }) ensures the newest address appears first
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

        // 5. Return the list of addresses
        return NextResponse.json(
            { 
                success: true, 
                addresses 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Address Error:", error.message);

        return NextResponse.json(
            { 
                success: false, 
                message: "Failed to fetch addresses", 
                error: error.message 
            },
            { status: 500 }
        );
    }
}