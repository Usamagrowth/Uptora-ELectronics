import { getDb } from "../mongodb";
import bcrypt from "bcryptjs";

export async function getUserIdByEmail(email) {
  if (!email) return null;
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  return user?._id?.toString() ?? null;
}

export async function verifyUserCredentials(email, password) {
  if (!email || !password) return null;
  
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  
  if (!user || !user.password) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  
  return user;
}

export async function createUserByEmail(email, password, name = null) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  
  const db = await getDb();
  
  // Check if user already exists
  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create user
  const result = await db.collection("users").insertOne({
    email,
    password: hashedPassword,
    name: name || email.split("@")[0],
    image: null,
    emailVerified: null,
    createdAt: new Date(),
    isAdmin: false,
  });
  
  return {
    _id: result.insertedId,
    email,
    name: name || email.split("@")[0],
    image: null,
  };
}

export async function createUserPassword(userId, password) {
  if (!userId || !password) {
    throw new Error("User ID and password are required");
  }
  
  const db = await getDb();
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const result = await db.collection("users").updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } }
  );
  
  return result.modifiedCount > 0;
}

export async function updateUserPassword(userId, newPassword) {
  if (!userId || !newPassword) {
    throw new Error("User ID and new password are required");
  }
  
  const db = await getDb();
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  const result = await db.collection("users").updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } }
  );
  
  return result.modifiedCount > 0;
}
