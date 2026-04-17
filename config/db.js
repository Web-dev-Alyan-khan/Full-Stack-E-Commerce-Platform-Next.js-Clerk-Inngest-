import mongoose from "mongoose";
import dns from "dns";

// Fix DNS (good for Pakistan / slow ISP)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI missing in .env");
}

// Global cache (for Next.js hot reload)
let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, {
        dbName: "E-Commerce-Platform",
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // better than connectTimeoutMS
      });
    }

    cached.conn = await cached.promise;

    console.log("✅ MongoDB Connected");

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB Error:", error.message);
    throw error;
  }
}

export default dbConnect;