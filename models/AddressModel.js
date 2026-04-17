import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    // Reference to the User (Clerk ID)
    userId: { 
        type: String, 
        required: true,
    },
    fullName: { 
        type: String, 
        required: true,
        trim: true 
    },
    phoneNumber: { 
        type: String, 
        required: true 
    },
    pincode: { 
        type: Number, 
        required: true 
    },
    area: { 
        type: String, 
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    },
    state: { 
        type: String, 
        required: true 
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Prevents re-creating the model during Next.js hot reloads
const Address = mongoose.models.address || mongoose.model("address", addressSchema);

export default Address;