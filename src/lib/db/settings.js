import { getDb } from "../mongodb";

const COLLECTION_NAME = "settings";

/**
 * Get site settings
 */
export async function getSettings() {
  const db = await getDb();
  const settings = await db.collection(COLLECTION_NAME).findOne({ type: "heroBanner" });
  return settings || null;
}

/**
 * Update hero banner settings
 */
export async function updateHeroBannerSettings(slides) {
  const db = await getDb();
  const result = await db.collection(COLLECTION_NAME).updateOne(
    { type: "heroBanner" },
    {
      $set: {
        type: "heroBanner",
        slides,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  return result;
}
