import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/config/db";
import Address from "@/models/AddressModel";

export async function POST(request) {
    try {
        // 1. Connect to Database
        await dbConnect();

        // 2. Get Authenticated User ID from Clerk
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // 3. Extract data from Request Body
        const { fullName, phoneNumber, pincode, area, city, state } = await request.json();

        // 4. Basic Validation
        if (!fullName || !phoneNumber || !pincode || !area || !city || !state) {
            return NextResponse.json(
                { success: false, message: "All fields are required." },
                { status: 400 }
            );
        }

        // 5. Create and Save the Address
        // Note: We use the userId from getAuth() to ensure security
        const newAddress = await Address.create({
            userId,
            fullName,
            phoneNumber,
            pincode,
            area,
            city,
            state
        });

        // 6. Return Success Response
        return NextResponse.json(
            { 
                success: true, 
                message: "Address added successfully", 
                data: newAddress 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error(" Add Address Error:", error.message);
        
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}