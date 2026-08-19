import { createUserByEmail } from "../../../lib/db/users";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await createUserByEmail(email, password, name);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[api/auth/register]", error);
    
    if (error.message === "User already exists") {
      return res.status(409).json({ error: "User already exists" });
    }
    
    return res.status(500).json({ error: "Failed to create account" });
  }
}