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

        // We use the exact field name 'userId' found in your MongoDB screenshot
        // .trim() ensures no hidden spaces break the match
        const addresses = await Address.find({ userId: userId.trim() });

        // Log to your terminal (not browser) to see what is happening
        console.log(`Searching for: ${userId}`);
        console.log(`Found: ${addresses.length} addresses`);

        return NextResponse.json({ 
            success: true, 
            addresses: addresses || [] 
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}