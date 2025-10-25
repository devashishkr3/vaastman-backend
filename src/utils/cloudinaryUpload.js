// const cloudinary = require("cloudinary").v2;
// const dotenv = require("dotenv");
// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// exports.uploadToCloudinary = async (filePath) => {
//   try {
//     const result = await cloudinary.uploader.upload(filePath, {
//       resource_type: "auto",
//       folder: "certificates",
//       use_filename: true,
//       unique_filename: false,
//       overwrite: false,
//     });
//     return result.secure_url;
//   } catch (err) {
//     console.error("Cloudinary upload failed:", err);
//     throw err;
//   }
// };

const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** 🔼 Upload file to Cloudinary */
exports.uploadToCloudinary = async (filePath, folder = "certificates") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw err;
  }
};

/** 🔽 Delete file from Cloudinary */
exports.deleteFromCloudinary = async (public_id) => {
  try {
    if (!public_id) return;
    await cloudinary.uploader.destroy(public_id, { resource_type: "raw" });
  } catch (err) {
    console.warn("Cloudinary delete failed:", err.message);
  }
};
