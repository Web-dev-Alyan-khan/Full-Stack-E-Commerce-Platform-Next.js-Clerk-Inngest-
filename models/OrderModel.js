import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        ref: 'user',
    },
    // Items as an array of objects
    items: [{
        productId: { type: String, required: true, ref: 'product' },
        quantity: { type: Number, required: true },
        // Optional: snapshot price/name here in case product info changes later
    }],
    amount: { 
        type: Number, 
        required: true 
    },
    // We store the full address object so history is preserved 
    // even if the user deletes the address from their profile.
    address: { 
        type: Object, 
        required: true 
    },
    status: { 
        type: String, 
        required: true, 
        default: "Order Placed",
    },
    payment: {
        type: Boolean,
        default: true
    },
    date: { 
        type: Number, 
        required: true,
        default: Date.now()
    }
}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;