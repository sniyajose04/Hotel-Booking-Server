import { Webhook } from "svix";
import connectDB from "../configs/db.js";
import User from "../models/User.js";

export default async function handler(req, res) {

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Connect DB (safe for serverless)
  await connectDB();

  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify webhook
    await whook.verify(JSON.stringify(req.body), headers);

    const { data, type } = req.body;

    console.log("Webhook received:", type);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
    };

    // Handle events
    if (type === "user.created") {
      await User.create(userData);
    }

    if (type === "user.updated") {
      await User.findByIdAndUpdate(data.id, userData);
    }

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.log("Webhook Error:", error.message);
    return res.status(400).json({ error: error.message });
  }
}