import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Address from "@/models/AddressModel";

export async function GET(request) {
    try {
        await dbConnect();
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Fetch addresses specifically for this Clerk userId
        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({ 
            success: true, 
            addresses: addresses || [] 
        }, { status: 200 });

    } catch (error) {
        console.error("Get Address Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}