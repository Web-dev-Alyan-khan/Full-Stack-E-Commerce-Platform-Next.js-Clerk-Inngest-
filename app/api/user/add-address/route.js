import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Address from "@/models/AddressModel";

export async function POST(request) {
    try {
        await dbConnect();

        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        const { fullName, phoneNumber, pincode, area, city, state } = await request.json();

        // Check for missing fields
        if (!fullName || !phoneNumber || !pincode || !area || !city || !state) {
            return NextResponse.json(
                { success: false, message: "All fields are required." },
                { status: 400 }
            );
        }

        // Create the address
        const newAddress = await Address.create({
            userId, // This links the address specifically to the logged-in Clerk user
            fullName,
            phoneNumber,
            pincode,
            area,
            city,
            state
        });

        return NextResponse.json(
            { 
                success: true, 
                message: "Address added successfully", 
                data: newAddress 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Add Address Error:", error.message);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}