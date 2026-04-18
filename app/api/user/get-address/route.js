import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Address from "@/models/AddressModel"; // Ensure this matches your file name

export async function GET(request) {
    try {
        await dbConnect();

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // Fetch addresses for the authenticated user
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

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
                message: "Failed to fetch addresses" 
            },
            { status: 500 }
        );
    }
}