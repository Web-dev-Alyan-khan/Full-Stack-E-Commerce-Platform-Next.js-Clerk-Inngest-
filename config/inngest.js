import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/userModel";

// Initialize the Inngest client
export const inngest = new Inngest({ id: "e-comerece-platform_next.js" });

// 1. Sync User Creation
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" }, 
  { event: "clerk/user.created" }, 
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    
    const user = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await dbConnect();
    // Using findByIdAndUpdate with upsert: true is safer for webhooks 
    // to prevent "duplicate key" errors if the webhook fires twice.
    await User.findByIdAndUpdate(id, user, { upsert: true, new: true });
    
    return { status: "success", message: "User Created/Synced" };
  }
);

// 2. Sync User Update
export const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    
    const userData = {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      imageUrl: image_url,
    };

    await dbConnect();
    await User.findByIdAndUpdate(id, userData);
    
    return { status: "success", message: "User Updated" };
  }
);

// 3. Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await dbConnect();
    await User.findByIdAndDelete(id);
    
    return { status: "success", message: "User Deleted" };
  }
);