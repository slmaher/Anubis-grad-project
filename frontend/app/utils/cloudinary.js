import { Platform } from "react-native";

/**
 * Uploads an image to Cloudinary using the unsigned upload preset.
 * Handles both base64 and local file URIs on mobile and web platforms.
 * 
 * @param {string} localUri - The local path, base64 data URI, or URL of the image.
 * @param {string} folder - The destination folder on Cloudinary (profiles, products, categories, banners, chat, app_uploads).
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export async function uploadImageToCloudinary(localUri, folder = "app_uploads") {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dh2fur94f";
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Anubies_unsigned";

  if (!localUri) {
    throw new Error("No image URI provided");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();

  // If localUri is base64 or a web-safe url
  if (
    localUri.startsWith("data:") ||
    localUri.startsWith("http://") ||
    localUri.startsWith("https://")
  ) {
    formData.append("file", localUri);
  } else {
    // Local file URI
    const uriParts = localUri.split(".");
    const fileType = uriParts[uriParts.length - 1] || "jpg";
    
    // In React Native, FormData needs an object for the file parameter on native platforms
    formData.append("file", {
      uri: Platform.OS === "android" ? localUri : localUri.replace("file://", ""),
      name: `upload.${fileType}`,
      type: `image/${fileType === "png" ? "png" : "jpeg"}`,
    });
  }

  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  console.log(`[Cloudinary] Starting upload to folder: ${folder}...`);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      "Accept": "application/json",
      // Do not set Content-Type; it is automatically handled by the FormData boundary
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[Cloudinary] Upload failed response:", errorData);
    throw new Error(errorData?.error?.message || `Cloudinary upload failed with status ${response.status}`);
  }

  const result = await response.json();
  console.log(`[Cloudinary] Upload success! Public ID: ${result.public_id}`);
  
  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}

/**
 * Generates an optimized Cloudinary URL with transformations: f_auto, q_auto, and custom width.
 * Handles both public IDs and existing full Cloudinary URLs.
 * 
 * @param {string} publicIdOrUrl - The Cloudinary public ID or full URL.
 * @param {number} width - The target width for the image.
 * @returns {string} The transformed Cloudinary URL.
 */
export function getCloudinaryUrl(publicIdOrUrl, width = 800) {
  if (!publicIdOrUrl) {
    return "";
  }

  if (typeof publicIdOrUrl !== "string") {
    return publicIdOrUrl; // If it's a number (e.g. from require('./assets...')), return it as is
  }

  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dh2fur94f";

  // If it's a full Cloudinary URL
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    if (publicIdOrUrl.includes("/upload/")) {
      const parts = publicIdOrUrl.split("/upload/");
      // Check if it already has transformations applied
      if (parts[1].startsWith("f_auto") || parts[1].includes("q_auto")) {
        return publicIdOrUrl;
      }
      return `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }

  // If it is already an external HTTP/S URL, return it as is
  if (
    publicIdOrUrl.startsWith("http://") ||
    publicIdOrUrl.startsWith("https://") ||
    publicIdOrUrl.startsWith("data:")
  ) {
    return publicIdOrUrl;
  }

  // If it's a public ID (e.g., "app_uploads/image_name"), construct the transformed URL
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicIdOrUrl}`;
}

/**
 * Resolves any image source (static require, dynamic URL, or public ID) to an optimized Cloudinary resource.
 * Useful for any image rendering component, including Image and ImageBackground.
 * 
 * @param {any} source - The source object (number from require, string, or object { uri }).
 * @param {number} width - The target width for optimization.
 * @returns {any} A resolved source suitable for React Native Image/ImageBackground.
 */
export function resolveImageSource(source, width = 800) {
  if (source === null || source === undefined) {
    return null;
  }

  // Handle local require() static assets
  if (typeof source === "number") {
    try {
      const { Asset } = require("expo-asset");
      const staticImageMap = require("./staticImageMap.json");
      
      const asset = Asset.fromModule(source);
      const filename = `${asset.name}.${asset.type}`;
      const mapping = staticImageMap[filename] || 
                      staticImageMap[`${asset.name}.png`] || 
                      staticImageMap[`${asset.name}.jpg`] || 
                      staticImageMap[`${asset.name}.jpeg`] || 
                      staticImageMap[`${asset.name}.webp`];
      
      if (mapping) {
        return { uri: getCloudinaryUrl(mapping.public_id, width) };
      }
    } catch (e) {
      console.warn("[Cloudinary] resolveImageSource failed to resolve static asset:", e);
    }
    return source; // Fallback to local asset if mapping not found
  }

  // Handle public ID or full URL passed as string
  if (typeof source === "string") {
    return { uri: getCloudinaryUrl(source, width) };
  }

  // Handle standard React Native source object { uri }
  if (source && typeof source === "object" && source.uri) {
    return {
      ...source,
      uri: getCloudinaryUrl(source.uri, width),
    };
  }

  return source;
}

