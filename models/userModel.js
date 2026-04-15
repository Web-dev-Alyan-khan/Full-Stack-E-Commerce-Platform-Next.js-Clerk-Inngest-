import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Often used with Clerk/Auth0 IDs
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    cartItems: { type: Object, default: {} }, // Stores items as { productId: quantity }
  },
  { minimize: false } // Ensures empty objects like cartItems are saved to the DB
);

// Check if the model already exists before creating a new one (Next.js specific)
const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;