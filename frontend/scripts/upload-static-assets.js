const fs = require("fs");
const path = require("path");

// Cloudinary Configuration
const CLOUD_NAME = "dh2fur94f";
const UPLOAD_PRESET = "Anubies_unsigned";
const FOLDER = "app_static"; // organize static assets here

const ASSETS_DIR = path.join(__dirname, "../assets/images");
const MAP_FILE = path.join(__dirname, "../app/utils/staticImageMap.json");

// Allowed image extensions
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

// Get MIME type of a file
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
    default:
      return "image/jpeg";
  }
}

async function uploadFileToCloudinary(filePath, filename) {
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);
  const base64Data = fileBuffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  
  // Create a clean ID without slashes or special characters
  const cleanId = path.basename(filename, path.extname(filename))
    .replace(/[^a-zA-Z0-9_-]/g, "_");

  // Attempt 1: Upload with filename_override to bypass base64 slash parsing
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: dataUri,
        upload_preset: UPLOAD_PRESET,
        public_id: cleanId,
        filename_override: `${cleanId}.jpg`, // Prevents Cloudinary from parsing dataUri as the filename
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    
    const err = await response.json().catch(() => ({}));
    console.log(`  ⚠️ Attempt 1 failed: ${err?.error?.message || "Unknown error"}. Retrying with folder parameter and filename_override...`);
  } catch (error) {
    console.log(`  ⚠️ Attempt 1 failed: ${error.message}.`);
  }

  // Attempt 2: Upload with folder and filename_override
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: dataUri,
      upload_preset: UPLOAD_PRESET,
      folder: FOLDER,
      public_id: cleanId,
      filename_override: `${cleanId}.jpg`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP error ${response.status}`);
  }

  return await response.json();
}

async function run() {
  console.log("🚀 Starting Cloudinary Static Assets Sync...");
  
  // Load existing mapping if available
  let mapping = {};
  if (fs.existsSync(MAP_FILE)) {
    try {
      mapping = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
      console.log(`📁 Loaded existing static map with ${Object.keys(mapping).length} entries.`);
    } catch (e) {
      console.warn("⚠️ Failed to parse existing staticImageMap.json, starting fresh.");
    }
  } else {
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  }

  // Read all files in the assets/images directory
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found at ${ASSETS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  console.log(`🔎 Found ${imageFiles.length} total image files in assets/images.`);

  let successCount = 0;
  let skippedCount = 0;
  let failureCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filename = imageFiles[i];
    const filePath = path.join(ASSETS_DIR, filename);

    // Skip if already uploaded
    if (mapping[filename] && mapping[filename].public_id) {
      console.log(`[${i + 1}/${imageFiles.length}] ⏭️ Skipping "${filename}" (already uploaded)`);
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${imageFiles.length}] 📤 Uploading "${filename}"...`);
    try {
      const result = await uploadFileToCloudinary(filePath, filename);
      
      // Store in mapping
      mapping[filename] = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      // Save mapping file progressively
      fs.writeFileSync(MAP_FILE, JSON.stringify(mapping, null, 2), "utf8");
      
      console.log(`  ✅ Success! Public ID: ${result.public_id}`);
      successCount++;

      // Small delay to prevent hitting rate-limiting on high volume
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`  ❌ Failed to upload "${filename}":`, error.message);
      failureCount++;
    }
  }

  console.log("\n=================================");
  console.log("🎉 Sync Completed!");
  console.log(`  - Successfully Uploaded: ${successCount}`);
  console.log(`  - Skipped (Already uploaded): ${skippedCount}`);
  console.log(`  - Failed: ${failureCount}`);
  console.log(`💾 Mapping saved to: ${MAP_FILE}`);
  console.log("=================================\n");
}

run().catch(err => {
  console.error("❌ Fatal error running sync:", err);
});
