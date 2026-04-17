import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true }, 
    images: { type: Array, required: true }, 
    category: { type: String, required: true },
    date: { type: Number, required: true }, 
    
    // Linking to the Seller (Clerk User ID)
    userId: { type: String, required: true }, 
  },
  { minimize: false }
);

// Check if the model already exists before creating a new one
const Product = mongoose.models.product || mongoose.model("product", productSchema);

export default Product;