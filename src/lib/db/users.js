import { getDb } from "../mongodb";

export async function getUserIdByEmail(email) {
  if (!email) return null;
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  return user?._id?.toString() ?? null;
}
