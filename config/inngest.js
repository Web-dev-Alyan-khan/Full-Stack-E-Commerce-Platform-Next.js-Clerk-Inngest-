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

//Inngest Founction to create user order in database
export const createUserOrder = inngest.createFunction(
  { 
    id: "create-user-order", // v4 unique ID
    retries: 5 
  },
  { event: "order/create" }, // v4 Trigger syntax
  async ({ event, step }) => {
    const { userId, items, amount, address } = event.data;

    // 1. Database Connection
    await dbConnect();

    // 2. Save Order to Database
    const order = await step.run("save-order", async () => {
      return await Order.create({
        userId,
        items,
        amount,
        address,
        payment: false,
        status: "Order Placed",
        date: Date.now(),
      });
    });

    // 3. Clear User Cart in Database
    await step.run("clear-cart", async () => {
      await User.findByIdAndUpdate(userId, { cartItems: {} });
    });

    return { 
        success: true, 
        orderId: order._id 
    };
  }
);