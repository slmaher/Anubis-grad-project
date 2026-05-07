import { Router } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import axios from "axios";
import aiController from "./ai.controller";
import { env } from "../../config/env";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "ai-scans");
fs.mkdirSync(uploadDir, { recursive: true });

// Server-side persistent cache for generated audio
const ttsCacheDir = path.join(process.cwd(), "tmp", "elevenlabs_tts_cache");
fs.mkdirSync(ttsCacheDir, { recursive: true });

// Simple in-process lock map to avoid duplicate concurrent calls
const serverGenerationLocks = new Map<string, Promise<string | null>>();

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `scan-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/analyze", upload.single("image"), (req, res) => {
  aiController.analyzeArtifact(req, res);
});

router.post("/tour-guide/speech", async (req, res) => {
  try {
    const rawText = typeof req.body?.text === "string" ? req.body.text : "";

    // Basic sanitize on server as well (remove JSON-like blocks, collapse whitespace)
    const text = String(rawText)
      .replace(/\{[^}]*\}|\[[^\]]*\]/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return res.status(400).json({ success: false, message: "text is required" });
    }

    if (!env.elevenLabsApiKey) {
      return res.status(500).json({
        success: false,
        message: "ElevenLabs API key is not configured on the backend",
      });
    }

    // Build cache key from voiceId + sanitized text
    const keyRaw = `${env.elevenLabsVoiceId}::${text}`;
    const keyHash = crypto.createHash("sha256").update(keyRaw).digest("hex");
    const cachedFilePath = path.join(ttsCacheDir, `${keyHash}.mp3`);

    // Return cached file if present
    if (fs.existsSync(cachedFilePath)) {
      console.log("♻️ ElevenLabs TTS cache hit for", keyHash);
      const audioBuffer = fs.readFileSync(cachedFilePath);
      const audioBase64 = audioBuffer.toString("base64");
      return res.json({
        success: true,
        data: { audioBase64, contentType: "audio/mpeg", cached: true },
      });
    }

    // If another request is generating, wait for it
    if (serverGenerationLocks.has(keyHash)) {
      console.log("🔁 Awaiting in-flight server generation for", keyHash);
      try {
        const existing = await serverGenerationLocks.get(keyHash);
        if (existing) {
          return res.json({
            success: true,
            data: { audioBase64: existing, contentType: "audio/mpeg", cached: true },
          });
        }
      } catch (err) {
        console.error("In-flight generation error:", err);
        return res.status(500).json({ success: false, message: "TTS generation failed" });
      }
    }

    const generationPromise = (async () => {
      try {
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${env.elevenLabsVoiceId}`,
          {
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          },
          {
            responseType: "arraybuffer",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": env.elevenLabsApiKey,
            },
            timeout: 30000,
          }
        );

        const audioBase64 = Buffer.from(response.data).toString("base64");

        try {
          fs.writeFileSync(cachedFilePath, Buffer.from(response.data));
          console.log("✅ Wrote TTS cache file:", cachedFilePath);
        } catch (fsErr) {
          console.warn("Could not write TTS cache file:", fsErr);
        }

        return audioBase64;
      } catch (error: any) {
        const status = error?.response?.status || 502;

        const rawData = error?.response?.data;
        let responseBody: any = null;

        if (Buffer.isBuffer(rawData)) {
          const text = rawData.toString("utf8");
          try {
            responseBody = JSON.parse(text);
          } catch {
            responseBody = text;
          }
        } else if (rawData instanceof ArrayBuffer) {
          const text = Buffer.from(rawData).toString("utf8");
          try {
            responseBody = JSON.parse(text);
          } catch {
            responseBody = text;
          }
        } else if (typeof rawData === "string") {
          try {
            responseBody = JSON.parse(rawData);
          } catch {
            responseBody = rawData;
          }
        } else {
          responseBody = rawData || null;
        }

        console.error("[ElevenLabs] TTS generation failed:", { status, responseBody });

        // Create a structured error so outer handler can return proper status/message
        const detail = responseBody?.detail || null;
        const detailCode = detail?.code || detail?.status || null;
        const structuredError: any = {
          status,
          message:
            status === 401
              ? detailCode === "missing_permissions"
                ? `ElevenLabs key missing permission: ${detail?.message || "required permission is not enabled"}`
                : "Invalid ElevenLabs API key"
              : status === 402
              ? detailCode === "paid_plan_required"
                ? detail?.message || "Payment required: this voice/model requires a paid plan"
                : "Payment required: ElevenLabs account billing/credits exhausted"
              : detail?.message || "ElevenLabs TTS generation failed",
          responseBody,
        };

        throw structuredError;
      }
    })();

    serverGenerationLocks.set(keyHash, generationPromise);

    try {
      const audioBase64 = await generationPromise;
      return res.json({
        success: true,
        data: { audioBase64, contentType: "audio/mpeg", cached: false },
      });
    } catch (err: any) {
      const status = err?.status || 502;
      const message = err?.message || "ElevenLabs TTS generation failed";
      const responseBody = err?.responseBody || null;

      if (status === 402) {
        console.warn("[ElevenLabs] payment required (402) returned from upstream");
      }

      return res.status(status).json({
        success: false,
        message,
        data: {
          responseBody,
        },
      });
    } finally {
      serverGenerationLocks.delete(keyHash);
    }
  } catch (error: any) {
    console.error("[ElevenLabs] unexpected speech route error:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error while generating speech",
    });
  }
});

router.get("/tour-guide/test-key", async (_req, res) => {
  try {
    if (!env.elevenLabsApiKey) {
      return res.status(500).json({
        success: false,
        message: "ElevenLabs API key is not configured on the backend",
      });
    }

    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        Accept: "application/json",
        "xi-api-key": env.elevenLabsApiKey,
      },
      timeout: 30000,
    });

    return res.json({
      success: true,
      data: {
        status: response.status,
        voicesCount: Array.isArray(response.data?.voices) ? response.data.voices.length : null,
        voices: response.data?.voices || [],
      },
    });
  } catch (error: any) {
    const status = error?.response?.status || 502;
    const responseBody =
      error?.response?.data instanceof ArrayBuffer
        ? Buffer.from(error.response.data).toString("utf8")
        : typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data || null;

    console.error("[ElevenLabs] key test failed:", { status, responseBody });

    const permissionHint =
      error?.response?.data?.detail?.status === "missing_permissions"
        ? `ElevenLabs key is missing permission: ${error.response.data.detail.message}`
        : null;

    return res.status(status).json({
      success: false,
      message: permissionHint || `ElevenLabs API error: ${status}`,
      data: {
        responseBody,
      },
    });
  }
});

router.get("/tour-guide/health", async (_req, res) => {
  return res.json({
    success: true,
    data: {
      elevenLabsKeyConfigured: Boolean(env.elevenLabsApiKey),
      elevenLabsVoiceId: env.elevenLabsVoiceId,
    },
  });
});

export { router as aiRouter };