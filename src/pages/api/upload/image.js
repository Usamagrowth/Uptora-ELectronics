import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth-options";

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(400).json(
        { error: "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables." }
      );
    }

    const formData = req.body;
    const file = formData.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return res.status(400).json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json(
        { error: "File size exceeds 5MB limit" }
      );
    }

    // Upload to Cloudinary
    const cloudinary = require("cloudinary").v2;
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "uptora-products",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1200, height: 1200, crop: "limit" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("[Cloudinary upload error]", error);
            reject(res.status(500).json(
              { error: "Failed to upload image to Cloudinary" }
            ));
          } else {
            resolve(res.status(200).json({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
            }));
          }
        }
      ).end(file.buffer);
    });
  } catch (error) {
    console.error("[api/upload/image]", error);
    return res.status(500).json(
      { error: error.message || "Image upload failed" }
    );
  }
}