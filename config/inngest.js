import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/userModel";
import Order from "@/models/OrderModel";

// Initialize Inngest
export const inngest = new Inngest({
  id: "ecommerce-platform-nextjs",
});


// ✅ 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }], // ✅ FIX
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const user = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await dbConnect();

    await User.findByIdAndUpdate(id, user, {
      upsert: true,
      new: true,
    });

    return { status: "success", message: "User Created/Synced" };
  }
);


// ✅ 2. Sync User Update
export const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }], // ✅ FIX
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;

    const userData = {
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await dbConnect();

    await User.findByIdAndUpdate(id, userData);

    return { status: "success", message: "User Updated" };
  }
);


// 3. Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }], 
  },
  async ({ event }) => {
    const { id } = event.data;

    await dbConnect();

    await User.findByIdAndDelete(id);

    return { status: "success", message: "User Deleted" };
  }
);

// create order inngest founction
export const createUserOrder = inngest.createFunction(
  { 
    id: "create-user-order", 
    triggers: [{ event: "order/create" }],
    retries: 5 
  },
  async ({ event, step }) => {
    const { userId, items, amount, address } = event.data;

    // 1. Database Connection (Ensure connection outside steps for stability)
    await dbConnect();

    // 2. Save Order to Database
    const order = await step.run("save-order", async () => {
      const newOrder = await Order.create({
        userId, // Clerk User ID
        items,
        amount,
        address,
        payment: false,
        status: "Order Placed",
        date: Date.now(),
      });
      
      // Essential: Convert Mongoose Doc to plain JSON for Inngest state
      return JSON.parse(JSON.stringify(newOrder));
    });

    // 3. Clear User Cart in Database
    await step.run("clear-cart", async () => {
      // FIX: Use findOneAndUpdate with clerkId because userId is a String from Clerk
      // If your User model uses _id as the Clerk ID, use findByIdAndUpdate.
      // Most common setup: { clerkId: userId }
      return await User.findOneAndUpdate(
        { clerkId: userId }, 
        { cartItems: {} },
        { new: true }
      );
    });

    return { 
        success: true, 
        orderId: order._id 
    };
  }
);